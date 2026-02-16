/*
** db/src/db/models/basil/recipe.rs
*/

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Recipe schema version
const SCHEMA_VERSION: usize = 0;

/// Recipe model
#[derive(Serialize, Deserialize)]
pub struct Recipe {
    _id: Uuid,
    schema_version: usize,
    title: String,
    ingredients: Vec<String>,
    instructions: Vec<String>,
}
