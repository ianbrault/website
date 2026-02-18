/*
** db/src/server/routes/basil/delete_user.rs
*/

use crate::db::{DatabaseHandle, models::basil::User};
use crate::server::{ServerState, routes::basil::invalid_login_response};
use crate::utils;

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

#[derive(Serialize, Deserialize)]
pub struct Request {
    email: String,
    password: String,
    #[serde(default)]
    device: Option<String>,
}

#[route]
pub async fn route(state: State<ServerState>, Json(body): Json<Request>) -> Result<Response> {
    info!("/basil/v2/user/delete");

    // Find the user matching the given email
    if let Some(user) = state
        .database
        .find_one::<User>(DatabaseHandle::Basil, doc! { "email": &body.email })
        .await?
    {
        // Compare the passwords
        if !utils::verify_password(body.password, user.password) {
            return Ok(invalid_login_response());
        }

        // Delete the user from the database
        state
            .database
            .collection::<User>(DatabaseHandle::Basil)
            .delete_one(doc! { "_id": user._id })
            .await?;
        info!("Deleted user {}", user._id);

        Ok(StatusCode::OK.into_response())
    } else {
        Ok(invalid_login_response())
    }
}
