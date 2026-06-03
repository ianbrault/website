/*
** db/src/db/models/basil/token.rs
*/

use crate::db::DatabaseCollection;

use bson::{DateTime, oid::ObjectId};
use serde::{Deserialize, Serialize};

/// Token schema version
const SCHEMA_VERSION: usize = 0;
/// Token validity duration (1 hour) in milliseconds
const VALIDITY_DURATION: i64 = 60 * 60 * 1000;

/// Token model
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Token {
    pub _id: ObjectId,
    schema_version: usize,
    pub user_id: ObjectId,
    pub expiration: DateTime,
}

impl Token {
    pub fn expiration(now: DateTime) -> DateTime {
        now.saturating_add_millis(VALIDITY_DURATION)
    }

    pub fn new(user_id: ObjectId, timestamp: DateTime) -> Self {
        Self {
            _id: ObjectId::new(),
            schema_version: SCHEMA_VERSION,
            user_id,
            expiration: Self::expiration(timestamp),
        }
    }

    pub fn has_expired(&self) -> bool {
        DateTime::now() > self.expiration
    }
}

impl DatabaseCollection for Token {
    fn name() -> String {
        "tokens".to_string()
    }

    fn id(&self) -> ObjectId {
        self._id
    }
}
