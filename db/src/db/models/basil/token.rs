/*
** db/src/db/models/basil/token.rs
*/

use crate::db::DatabaseCollection;

use bson::DateTime;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// User schema version
const SCHEMA_VERSION: usize = 0;
/// Token validity duration (1 hour) in milliseconds
const VALIDITY_DURATION: i64 = 60 * 60 * 1000;

/// User model
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Token {
    pub _id: Uuid,
    schema_version: usize,
    pub user_id: Uuid,
    pub expiration: DateTime,
}

impl Token {
    pub fn expiration_from_now() -> DateTime {
        DateTime::now().saturating_add_millis(VALIDITY_DURATION)
    }

    pub fn new(user_id: Uuid) -> Self {
        Self {
            _id: Uuid::new_v4(),
            schema_version: SCHEMA_VERSION,
            user_id,
            expiration: Self::expiration_from_now(),
        }
    }
}

impl DatabaseCollection for Token {
    fn name() -> String {
        "tokens".to_string()
    }
}
