/*
** db/src/server/routes/basil/ping.rs
*/

use crate::db::{
    DatabaseHandle,
    models::basil::{Token, User},
};
use crate::server::ServerState;

use anyhow::Result;
use axum::{
    Json,
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use bson::doc;
use log::info;
use route_macro::route;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct Request {
    user_id: Uuid,
    token_id: Uuid,
}

#[route]
pub async fn route(state: State<ServerState>, Json(body): Json<Request>) -> Result<Response> {
    info!("/basil/v2/user/ping");

    // Find the user and token matching the given IDs
    if let Some(user) = state
        .database
        .find_one::<User>(DatabaseHandle::Basil, doc! { "_id": &body.user_id })
        .await?
    {
        if let Some(token) = state
            .database
            .find_one::<Token>(DatabaseHandle::Basil, doc! { "_id": &body.token_id })
            .await?
        {
            // Verify that the user ID linked to the token matches
            if user._id == token.user_id {
                // Bump the expiration time of the token
                let query = doc! { "_id": &body.token_id };
                let update = doc! {
                    "$set": doc! { "expiration": Token::expiration_from_now() }
                };
                state
                    .database
                    .collection::<Token>(DatabaseHandle::Basil)
                    .update_one(query, update)
                    .await?;

                return Ok(StatusCode::OK.into_response());
            }
        }
    }
    Ok((StatusCode::BAD_REQUEST, "Invalid ping request".to_string()).into_response())
}
