/*
** db/src/server/routes/basil/mod.rs
*/

mod authenticate_user;
mod create_user;

use crate::db::{Connection, DatabaseHandle, models::basil::Token};
use crate::server::ServerState;

use anyhow::Result;
use axum::{Router, routing::post};
use log::debug;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Common response body for user create and authenticate routes
#[derive(Serialize, Deserialize)]
pub struct UserLoginResponse {
    id: Uuid,
    email: String,
    root: Uuid,
    recipes: Vec<Uuid>,
    folders: Vec<Uuid>,
    sequence: usize,
    token: Uuid,
}

/// Generate a new token for the given user ID and insert it into the database
pub async fn generate_token(database: &Connection, user_id: Uuid) -> Result<Token> {
    let token = Token::new(user_id);
    database
        .insert(DatabaseHandle::Basil, token.clone())
        .await?;
    debug!("Created new token: {:?}", token);
    Ok(token)
}

pub fn router(state: ServerState) -> Router {
    Router::new()
        .route("/v2/user/authenticate", post(authenticate_user::route))
        .route("/v2/user/create", post(create_user::route))
        .with_state(state)
}
