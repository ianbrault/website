/*
** db/src/db/models/basil/folder.rs
*/

use crate::db::DatabaseCollection;

use bson::{DateTime, Document, doc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Folder schema version
const SCHEMA_VERSION: usize = 0;

/// Folder model
#[derive(Clone, Deserialize, Serialize)]
pub struct Folder {
    pub _id: Uuid,
    schema_version: usize,
    pub name: String,
    pub parent: Option<Uuid>,
    recipes: Vec<Uuid>,
    subfolders: Vec<Uuid>,
    pub modified: DateTime,
}

impl Folder {
    pub fn new(name: String, parent: Option<Uuid>, timestamp: DateTime) -> Self {
        Self {
            _id: Uuid::new_v4(),
            schema_version: SCHEMA_VERSION,
            name,
            parent,
            recipes: Vec::new(),
            subfolders: Vec::new(),
            modified: timestamp,
        }
    }

    pub fn add_recipe(&mut self, recipe: Uuid, timestamp: DateTime) {
        self.recipes.push(recipe);
        self.modified = timestamp;
    }

    pub fn add_subfolder(&mut self, subfolder: Uuid, timestamp: DateTime) {
        self.subfolders.push(subfolder);
        self.modified = timestamp;
    }

    pub fn remove_recipe(&mut self, recipe: Uuid, timestamp: DateTime) {
        if let Some(index) = self.recipes.iter().position(|i| *i == recipe) {
            self.recipes.remove(index);
            self.modified = timestamp;
        }
    }

    pub fn remove_subfolder(&mut self, subfolder: Uuid, timestamp: DateTime) {
        if let Some(index) = self.subfolders.iter().position(|i| *i == subfolder) {
            self.subfolders.remove(index);
            self.modified = timestamp;
        }
    }
}

impl DatabaseCollection for Folder {
    fn name() -> String {
        "folders".to_string()
    }

    fn id_query(&self) -> Document {
        doc! { "_id": self._id }
    }
}
