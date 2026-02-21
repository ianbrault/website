/*
** db/src/db/models/basil/user.rs
*/

use crate::db::DatabaseCollection;
use crate::types::CircularBuffer;

use bson::{DateTime, Document, doc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use std::collections::HashMap;

/// User schema version
const SCHEMA_VERSION: usize = 2;
/// Size of the user action journal
const JOURNAL_SIZE: usize = 256;

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
pub enum ItemType {
    Recipe,
    Folder,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
pub enum ActionType {
    Create,
    Modify,
    Delete,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
pub struct Action {
    timestamp: DateTime,
    item: ItemType,
    action: ActionType,
    item_id: Uuid,
}

impl Action {
    pub fn new(timestamp: DateTime, item: ItemType, action: ActionType, item_id: Uuid) -> Self {
        Self {
            timestamp,
            item,
            action,
            item_id,
        }
    }
}

/// User model
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct User {
    pub _id: Uuid,
    schema_version: usize,
    pub email: String,
    pub password: String,
    pub root: Uuid,
    pub recipes: Vec<Uuid>,
    pub folders: Vec<Uuid>,
    /// Maps devices to the last timestamp they pinged the server
    devices: HashMap<String, DateTime>,
    /// Action journal used to track all actions made for the user
    action_journal: CircularBuffer<Action>,
}

impl User {
    pub fn new(
        email: String,
        password: String,
        root: Uuid,
        recipes: Vec<Uuid>,
        folders: Vec<Uuid>,
        device: String,
    ) -> Self {
        let mut devices = HashMap::new();
        devices.insert(device, DateTime::now());
        Self {
            _id: Uuid::new_v4(),
            schema_version: SCHEMA_VERSION,
            email,
            password,
            root,
            recipes,
            folders,
            devices,
            action_journal: CircularBuffer::new(JOURNAL_SIZE),
        }
    }

    pub fn device_pinged(&mut self, device: String, timestamp: DateTime) {
        self.devices.insert(device, timestamp);
    }

    pub fn add_action(&mut self, action: Action) {
        self.action_journal.push(action)
    }

    pub fn remove_folder(&mut self, folder: Uuid) {
        if let Some(index) = self.folders.iter().position(|i| *i == folder) {
            self.folders.remove(index);
        }
    }

    pub fn remove_recipe(&mut self, recipe: Uuid) {
        if let Some(index) = self.recipes.iter().position(|i| *i == recipe) {
            self.recipes.remove(index);
        }
    }
}

impl DatabaseCollection for User {
    fn name() -> String {
        "users".to_string()
    }

    fn id_query(&self) -> Document {
        doc! { "_id": self._id }
    }
}
