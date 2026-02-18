/*
** db/src/server/routes/basil/authenticate_user.rs
*/

use crate::db::{DatabaseHandle, models::basil::User};
use crate::server::{
    ServerState,
    routes::basil::{UserLoginResponse, generate_token},
};
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
pub struct RouteRequest {
    email: String,
    password: String,
    #[serde(default)]
    device: Option<String>,
}

#[route]
pub async fn route(state: State<ServerState>, Json(body): Json<RouteRequest>) -> Result<Response> {
    info!("/basil/v2/user/authenticate");

    let invalid_login = Ok((
        StatusCode::BAD_REQUEST,
        "Invalid email/password".to_string(),
    )
        .into_response());

    // Find the user matching the given email
    if let Some(user) = state
        .database
        .find_one::<User>(DatabaseHandle::Basil, doc! { "email": &body.email })
        .await?
    {
        // Compare the passwords
        if !utils::verify_password(body.password, user.password) {
            return invalid_login;
        }

        // Generate a new token for the user
        let token = generate_token(&state.database, user._id).await?;

        let response = UserLoginResponse {
            id: user._id,
            email: user.email,
            root: user.root,
            recipes: user.recipes,
            folders: user.folders,
            sequence: user.sequence,
            token: token._id,
        };
        Ok(Json(response).into_response())
    } else {
        invalid_login
    }
}
