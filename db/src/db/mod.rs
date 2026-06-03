/*
** db/src/db/mod.rs
*/

pub mod models;

use anyhow::{Result, bail};
use bson::{Document, doc, oid::ObjectId};
use futures::future;
use log::info;
use mongodb::{
    Client, Collection,
    results::{DeleteResult, InsertOneResult, UpdateResult},
};
use serde::{Serialize, de::DeserializeOwned};

/// Individual databases within MongoDB
#[derive(Clone, Copy)]
pub enum DatabaseHandle {
    Basil,
}

impl DatabaseHandle {
    fn value(&self) -> &'static str {
        match self {
            Self::Basil => "basil",
        }
    }
}

/// Database collection trait, this should be implemented for model structs
pub trait DatabaseCollection {
    fn name() -> String;
    fn id(&self) -> ObjectId;
}

/// MongoDB database connection
#[derive(Clone)]
pub struct Connection {
    client: Client,
}

impl Connection {
    /// Create the connection object and connect to the database
    pub async fn new(uri: String) -> Result<Self> {
        let client = Client::with_uri_str(uri.clone()).await?;
        // Send a ping to confirm the connection
        client
            .database("test")
            .run_command(doc! { "ping": 1 })
            .await?;
        info!("Connected to database {}", uri);
        Ok(Self { client })
    }

    /// Return the collection for the model type from the database
    pub fn collection<T>(&self, handle: DatabaseHandle) -> Collection<T>
    where
        T: DatabaseCollection + Send + Sync,
    {
        self.client.database(handle.value()).collection(&T::name())
    }

    /// Find a model in the database using the given query
    pub async fn find_one<T>(&self, handle: DatabaseHandle, query: Document) -> Result<Option<T>>
    where
        T: DatabaseCollection + DeserializeOwned + Send + Sync,
    {
        let result = self.collection::<T>(handle).find_one(query).await?;
        Ok(result)
    }

    /// Find a model in the database given the ID
    pub async fn find_one_by_id<T>(&self, handle: DatabaseHandle, id: ObjectId) -> Result<Option<T>>
    where
        T: DatabaseCollection + DeserializeOwned + Send + Sync,
    {
        self.find_one(handle, doc! { "_id": id }).await
    }

    /// Find multiple models in the database given their IDs
    pub async fn find_many_by_id<I, T>(&self, handle: DatabaseHandle, id_list: I) -> Result<Vec<T>>
    where
        I: IntoIterator<Item = ObjectId>,
        T: DatabaseCollection + DeserializeOwned + Send + Sync,
    {
        let ids = id_list.into_iter().collect::<Vec<_>>();
        let queries =
            future::try_join_all(ids.iter().map(|id| self.find_one_by_id::<T>(handle, *id)))
                .await?;
        let mut output = Vec::with_capacity(queries.len());
        for (query, id) in queries.into_iter().zip(ids) {
            if let Some(model) = query {
                output.push(model);
            } else {
                bail!("Failed to find a model for ID {}", id);
            }
        }
        Ok(output)
    }

    /// Insert a model into its collection in the database
    pub async fn insert<T>(&self, handle: DatabaseHandle, model: T) -> Result<InsertOneResult>
    where
        T: DatabaseCollection + Send + Serialize + Sync,
    {
        let result = self.collection::<T>(handle).insert_one(model).await?;
        Ok(result)
    }

    /// Update a model in the database
    pub async fn update_one<T>(
        &self,
        handle: DatabaseHandle,
        query: Document,
        update: Document,
    ) -> Result<UpdateResult>
    where
        T: DatabaseCollection + Send + Sync,
    {
        let result = self
            .collection::<T>(handle)
            .update_one(query, update)
            .await?;
        Ok(result)
    }

    /// Replace a model in the database, using an ID match query
    pub async fn replace_one<T>(&self, handle: DatabaseHandle, model: T) -> Result<UpdateResult>
    where
        T: DatabaseCollection + Send + Serialize + Sync,
    {
        let result = self
            .collection::<T>(handle)
            .replace_one(doc! { "_id": model.id() }, model)
            .await?;
        Ok(result)
    }

    /// Delete a model from the database
    pub async fn delete_one<T>(
        &self,
        handle: DatabaseHandle,
        query: Document,
    ) -> Result<DeleteResult>
    where
        T: DatabaseCollection + Send + Sync,
    {
        let result = self.collection::<T>(handle).delete_one(query).await?;
        Ok(result)
    }
}
