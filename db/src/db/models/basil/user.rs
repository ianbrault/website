/*
** db/src/db/models/basil/user.rs
*/

use crate::db::DatabaseCollection;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// User schema version
const SCHEMA_VERSION: usize = 2;

/// User model
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub _id: Uuid,
    schema_version: usize,
    pub email: String,
    pub password: String,
    pub root: Uuid,
    pub recipes: Vec<Uuid>,
    pub folders: Vec<Uuid>,
    pub devices: Vec<String>,
    pub sequence: usize,
}

impl User {
    pub fn new(
        email: String,
        password: String,
        root: Uuid,
        recipes: Vec<Uuid>,
        folders: Vec<Uuid>,
        devices: Vec<String>,
    ) -> Self {
        Self {
            _id: Uuid::new_v4(),
            schema_version: SCHEMA_VERSION,
            email,
            password,
            root,
            recipes,
            folders,
            devices,
            sequence: 0,
        }
    }
}

impl DatabaseCollection for User {
    fn name() -> String {
        "users".to_string()
    }
}
