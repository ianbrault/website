/*
** db/src/db/models/basil/folder.rs
*/

use crate::db::DatabaseCollection;

use bson::{DateTime, oid::ObjectId};
use serde::{Deserialize, Serialize};

/// Folder schema version
const SCHEMA_VERSION: usize = 0;

/// Folder model
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Folder {
    pub _id: ObjectId,
    schema_version: usize,
    pub name: String,
    pub parent: Option<ObjectId>,
    recipes: Vec<ObjectId>,
    subfolders: Vec<ObjectId>,
    pub modified: DateTime,
}

impl Folder {
    pub fn new(name: String, parent: Option<ObjectId>, timestamp: DateTime) -> Self {
        Self::new_with_id(ObjectId::new(), name, parent, timestamp)
    }

    pub fn new_with_id(
        _id: ObjectId,
        name: String,
        parent: Option<ObjectId>,
        timestamp: DateTime,
    ) -> Self {
        Self {
            _id,
            schema_version: SCHEMA_VERSION,
            name,
            parent,
            recipes: Vec::new(),
            subfolders: Vec::new(),
            modified: timestamp,
        }
    }

    pub fn add_recipes(&mut self, recipes: Vec<ObjectId>, timestamp: DateTime) {
        self.recipes.extend(recipes);
        self.modified = timestamp;
    }

    pub fn add_subfolders(&mut self, subfolders: Vec<ObjectId>, timestamp: DateTime) {
        self.subfolders.extend(subfolders);
        self.modified = timestamp;
    }

    pub fn remove_recipe(&mut self, recipe: ObjectId, timestamp: DateTime) {
        if let Some(index) = self.recipes.iter().position(|i| *i == recipe) {
            self.recipes.remove(index);
            self.modified = timestamp;
        }
    }

    pub fn remove_subfolder(&mut self, subfolder: ObjectId, timestamp: DateTime) {
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

    fn id(&self) -> ObjectId {
        self._id
    }
}
