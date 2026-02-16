/*
** db/src/db/models/basil/folder.rs
*/

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Folder schema version
const SCHEMA_VERSION: usize = 0;

/// Folder model
#[derive(Serialize, Deserialize)]
pub struct Folder {
    _id: Uuid,
    schema_version: usize,
    parent: Option<Uuid>,
    name: String,
    recipes: Vec<Uuid>,
    subfolders: Vec<Uuid>,
}
