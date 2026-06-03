/*
** db/src/db/models/basil/recipe.rs
*/

use crate::db::DatabaseCollection;

use bson::{DateTime, oid::ObjectId};
use serde::{Deserialize, Serialize};

/// Recipe schema version
const SCHEMA_VERSION: usize = 0;

/// Recipe model
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Recipe {
    pub _id: ObjectId,
    schema_version: usize,
    pub title: String,
    pub parent: Option<ObjectId>,
    pub ingredients: Vec<String>,
    pub instructions: Vec<String>,
    pub modified: DateTime,
}

impl Recipe {
    pub fn new(
        title: String,
        parent: Option<ObjectId>,
        ingredients: Vec<String>,
        instructions: Vec<String>,
        timestamp: DateTime,
    ) -> Self {
        Self::new_with_id(
            ObjectId::new(),
            title,
            parent,
            ingredients,
            instructions,
            timestamp,
        )
    }

    pub fn new_with_id(
        _id: ObjectId,
        title: String,
        parent: Option<ObjectId>,
        ingredients: Vec<String>,
        instructions: Vec<String>,
        timestamp: DateTime,
    ) -> Self {
        Self {
            _id,
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

    fn id(&self) -> ObjectId {
        self._id
    }
}
