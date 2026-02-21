/*
** db/src/db/models/basil/recipe.rs
*/

use crate::db::DatabaseCollection;

use bson::{DateTime, Document, doc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Recipe schema version
const SCHEMA_VERSION: usize = 0;

/// Recipe model
#[derive(Clone, Deserialize, Serialize)]
pub struct Recipe {
    pub _id: Uuid,
    schema_version: usize,
    pub title: String,
    pub parent: Option<Uuid>,
    pub ingredients: Vec<String>,
    pub instructions: Vec<String>,
    pub modified: DateTime,
}

impl Recipe {
    pub fn new(title: String, parent: Option<Uuid>, ingredients: Vec<String>, instructions: Vec<String>, timestamp: DateTime) -> Self {
        Self {
            _id: Uuid::new_v4(),
            schema_version: SCHEMA_VERSION,
            title,
            parent,
            ingredients,
            instructions,
            modified: timestamp,
        }
    }
}

impl DatabaseCollection for Recipe {
    fn name() -> String {
        "recipes".to_string()
    }

    fn id_query(&self) -> Document {
        doc! { "_id": self._id }
    }
}
