/*
** db/src/db/models/basil/action.rs
*/

use bson::{DateTime, oid::ObjectId};
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
pub enum ActionType {
    Create,
    Modify,
    Delete,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
pub enum ItemType {
    Recipe,
    Folder,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
pub struct Action {
    pub timestamp: DateTime,
    item: ItemType,
    action: ActionType,
    item_id: ObjectId,
}

impl Action {
    pub fn new(timestamp: DateTime, item: ItemType, action: ActionType, item_id: ObjectId) -> Self {
        Self {
            timestamp,
            item,
            action,
            item_id,
        }
    }
}
