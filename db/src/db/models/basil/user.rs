/*
** db/src/db/models/basil/user.rs
*/

use super::Action;
use crate::db::DatabaseCollection;
use crate::types::CircularBuffer;

use bson::{DateTime, oid::ObjectId};
use serde::{Deserialize, Serialize};

use std::collections::HashMap;

/// User schema version
const SCHEMA_VERSION: usize = 2;
/// Size of the user action journal
const JOURNAL_SIZE: usize = 256;

/// User model
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct User {
    pub _id: ObjectId,
    schema_version: usize,
    pub email: String,
    pub password: String,
    pub root: ObjectId,
    pub recipes: Vec<ObjectId>,
    pub folders: Vec<ObjectId>,
    /// Maps devices to the last timestamp they pinged the server
    devices: HashMap<String, DateTime>,
    /// Action journal used to track all actions made for the user
    action_journal: CircularBuffer<Action>,
}

impl User {
    pub fn new(
        email: String,
        password: String,
        root: ObjectId,
        device: String,
        timestamp: DateTime,
    ) -> Self {
        let mut devices = HashMap::new();
        devices.insert(device, timestamp);
        Self {
            _id: ObjectId::new(),
            schema_version: SCHEMA_VERSION,
            email,
            password,
            root,
            recipes: Vec::new(),
            folders: vec![root],
            devices,
            action_journal: CircularBuffer::new(JOURNAL_SIZE),
        }
    }

    pub fn device_pinged(&mut self, device: String, timestamp: DateTime) -> Option<DateTime> {
        self.devices.insert(device, timestamp)
    }

    pub fn add_action(&mut self, action: Action) {
        self.action_journal.push(action);
    }

    pub fn actions_since(&self, timestamp: Option<DateTime>) -> Vec<Action> {
        if let Some(timestamp) = timestamp {
            self.action_journal
                .iter()
                .filter(|a| a.timestamp >= timestamp)
                .cloned()
                .collect()
        } else {
            self.action_journal.iter().cloned().collect()
        }
    }

    pub fn remove_folder(&mut self, folder: ObjectId) {
        if let Some(index) = self.folders.iter().position(|i| *i == folder) {
            self.folders.remove(index);
        }
    }

    pub fn remove_recipe(&mut self, recipe: ObjectId) {
        if let Some(index) = self.recipes.iter().position(|i| *i == recipe) {
            self.recipes.remove(index);
        }
    }
}

impl DatabaseCollection for User {
    fn name() -> String {
        "users".to_string()
    }

    fn id(&self) -> ObjectId {
        self._id
    }
}
