/*
** db/src/server/routes/basil/user.rs
*/

use super::utils;
use crate::db::{
    DatabaseCollection, DatabaseHandle,
    models::basil::{Token, User},
};
use crate::server::ServerState;

use anyhow::Result;
use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::post,
};
use bson::{DateTime, doc};
use log::{debug, info};
use route_macro::route;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Common response for an invalid username/password
fn invalid_login_response() -> Response {
    (
        StatusCode::BAD_REQUEST,
        "Invalid email/password".to_string(),
    )
        .into_response()
}

/// Request body for authenticate user route
#[derive(Serialize, Deserialize)]
pub struct AuthenticateRequest {
    email: String,
    password: String,
    #[serde(default)]
    device: Option<String>,
}

/// Response body for authenticate user route
#[derive(Serialize, Deserialize)]
pub struct AuthenticateResponse {
    id: Uuid,
    email: String,
    root: Uuid,
    recipes: Vec<Uuid>,
    folders: Vec<Uuid>,
    token: Uuid,
}

/// Authenticate user route
#[route]
pub async fn authenticate_route(
    state: State<ServerState>,
    Json(body): Json<AuthenticateRequest>,
) -> Result<Response> {
    info!("/basil/v2/user/authenticate");

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

        // Generate a new token for the user
        let token = utils::generate_token(&state.database, user._id).await?;

        let response = AuthenticateResponse {
            id: user._id,
            email: user.email,
            root: user.root,
            recipes: user.recipes,
            folders: user.folders,
            token: token._id,
        };
        Ok(Json(response).into_response())
    } else {
        Ok(invalid_login_response())
    }
}

/// Request body for create user route
#[derive(Serialize, Deserialize)]
pub struct CreateRequest {
    email: String,
    password: String,
    root: Uuid,
    #[serde(default)]
    recipes: Vec<Uuid>,
    #[serde(default)]
    folders: Vec<Uuid>,
    device: String,
}

/// Response body for create user route
#[derive(Serialize, Deserialize)]
pub struct CreateResponse {
    id: Uuid,
    email: String,
    root: Uuid,
    recipes: Vec<Uuid>,
    folders: Vec<Uuid>,
    token: Uuid,
}

/// Create user route
#[route]
pub async fn create_route(
    state: State<ServerState>,
    Json(body): Json<CreateRequest>,
) -> Result<Response> {
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
    let user = User::new(
        body.email,
        hashed_password,
        body.root,
        body.recipes,
        body.folders,
        body.device,
    );
    debug!("Created user: {:?}", user);

    // Insert the user model into the database
    state
        .database
        .insert(DatabaseHandle::Basil, user.clone())
        .await?;
    info!("Created new user {}", user._id);

    // Generate a new token for the user
    let token = utils::generate_token(&state.database, user._id).await?;

    let response = CreateResponse {
        id: user._id,
        email: user.email,
        root: user.root,
        recipes: user.recipes,
        folders: user.folders,
        token: token._id,
    };
    Ok(Json(response).into_response())
}

/// Request body for delete user route
#[derive(Serialize, Deserialize)]
pub struct DeleteRequest {
    email: String,
    password: String,
}

/// Delete user route
#[route]
pub async fn delete_route(
    state: State<ServerState>,
    Json(body): Json<DeleteRequest>,
) -> Result<Response> {
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

/// Request body for ping route
#[derive(Serialize, Deserialize)]
pub struct PingRequest {
    user_id: Uuid,
    token_id: Uuid,
    device: String,
}

/// Ping route
#[route]
pub async fn ping_route(
    state: State<ServerState>,
    Json(body): Json<PingRequest>,
) -> Result<Response> {
    info!("/basil/v2/user/ping");
    let timestamp = DateTime::now();

    // Validate the given token
    if let Some((mut user, token)) =
        utils::validate_user_token(&state.database, body.user_id, body.token_id).await?
    {
        // Bump the expiration time of the token
        let update = doc! {
            "$set": doc! { "expiration": Token::expiration(timestamp) }
        };
        state
            .database
            .update_one::<Token>(DatabaseHandle::Basil, token.id_query(), update)
            .await?;

        // Store the time that the user pinged from this device
        // FIXME: use the previous time to find all actions that need to be sent back to the user
        user.device_pinged(body.device, timestamp);
        state.database.replace_one(DatabaseHandle::Basil, user).await?;

        Ok(StatusCode::OK.into_response())
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

pub fn router(state: ServerState) -> Router {
    Router::new()
        .route("/authenticate", post(authenticate_route))
        .route("/create", post(create_route))
        .route("/delete", post(delete_route))
        .route("/ping", post(ping_route))
        .with_state(state)
}
