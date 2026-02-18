/*
** db/src/db/mod.rs
*/

pub mod models;

use anyhow::Result;
use bson::{Document, doc};
use log::info;
use mongodb::{
    Client, Collection,
    results::{InsertOneResult, UpdateResult},
};
use serde::{Serialize, de::DeserializeOwned};

/// Individual databases within MongoDB
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
}
