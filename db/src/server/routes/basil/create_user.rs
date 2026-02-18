/*
** db/src/server/routes/basil/create_user.rs
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
use log::{debug, info};
use route_macro::route;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct Request {
    email: String,
    password: String,
    root: Uuid,
    #[serde(default)]
    recipes: Vec<Uuid>,
    #[serde(default)]
    folders: Vec<Uuid>,
    #[serde(default)]
    device: Option<String>,
}

#[route]
pub async fn route(state: State<ServerState>, Json(body): Json<Request>) -> Result<Response> {
    info!("/basil/v2/user/create");

    // Check for a pre-existing user with the same email
    if state
        .database
        .find_one::<User>(DatabaseHandle::Basil, doc! { "email": &body.email })
        .await?
        .is_some()
    {
        info!("A user with email {} already exists", body.email);
        return Ok((
            StatusCode::BAD_REQUEST,
            format!("A user with email \"{}\" already exists", body.email),
        )
            .into_response());
    }

    // Create the user model
    let hashed_password = utils::hash_password(body.password)?;
    let devices = if let Some(device) = body.device {
        vec![device]
    } else {
        Vec::new()
    };
    let user = User::new(
        body.email,
        hashed_password,
        body.root,
        body.recipes,
        body.folders,
        devices,
    );
    debug!("Created user: {:?}", user);

    // Insert the user model into the database
    state
        .database
        .insert(DatabaseHandle::Basil, user.clone())
        .await?;
    info!("Created new user {}", user._id);

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
}
