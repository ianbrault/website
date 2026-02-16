/*
** db/src/db/mod.rs
*/

pub mod models;

use anyhow::Result;
use bson::doc;
use log::info;
use mongodb::{Client, Collection};

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
        client.database("test").run_command(doc! { "ping": 1 }).await?;
        info!("Connected to database {}", uri);
        Ok(Self { client })
    }

    pub fn collection<T>(&self, handle: DatabaseHandle) -> Collection<T>
    where
        T: DatabaseCollection + Send + Sync,
    {
        self.client.database(handle.value()).collection(&T::name())
    }
}
