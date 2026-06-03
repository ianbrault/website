/*
** db/src/server/routes/basil/user.rs
*/

use super::utils;
use crate::db::{
    DatabaseCollection, DatabaseHandle,
    models::basil::{Action, Folder, Recipe, Token, User},
};
use crate::server::ServerState;

use anyhow::Result;
use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
};
use bson::{DateTime, doc, oid::ObjectId};
use log::{debug, info};
use route_macro::route;
use serde::{Deserialize, Serialize};

/// Common fields for user authentication (after login)
#[derive(Deserialize, Serialize)]
pub struct AuthenticationFields {
    pub user_id: ObjectId,
    pub token_id: ObjectId,
    pub device: String,
}

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
struct AuthenticateRequest {
    email: String,
    password: String,
    device: String,
}

/// Response body for authenticate user route
#[derive(Serialize, Debug, Deserialize)]
struct AuthenticateResponse {
    id: ObjectId,
    email: String,
    root: ObjectId,
    recipes: Vec<Recipe>,
    folders: Vec<Folder>,
    token: ObjectId,
}

/// Authenticate user route
#[route]
pub async fn authenticate_route(
    state: State<ServerState>,
    Json(body): Json<AuthenticateRequest>,
) -> Result<Response> {
    info!("/basil/v2/user/authenticate");
    let timestamp = DateTime::now();

    // Find the user matching the given email
    if let Some(mut user) = state
        .database
        .find_one::<User>(DatabaseHandle::Basil, doc! { "email": &body.email })
        .await?
    {
        // Compare the passwords
        if !utils::verify_password(body.password, &user.password) {
            return Ok(invalid_login_response());
        }

        // Generate a new token for the user
        let token = utils::generate_token(&state.database, user._id, timestamp).await?;

        // Track the timestamp as the last ping for this device
        user.device_pinged(body.device, timestamp);
        // Store the updated user
        state
            .database
            .replace_one(DatabaseHandle::Basil, user.clone())
            .await?;

        // Populate the recipes and folders from their IDs
        let recipes = state
            .database
            .find_many_by_id(DatabaseHandle::Basil, user.recipes)
            .await?;
        let folders = state
            .database
            .find_many_by_id(DatabaseHandle::Basil, user.folders)
            .await?;

        info!("Successfully authenticated user {} ({})", user.email, user._id);
        let response = AuthenticateResponse {
            id: user._id,
            email: user.email,
            root: user.root,
            recipes,
            folders,
            token: token._id,
        };
        debug!("Authentication response: {:?}", response);
        Ok(Json(response).into_response())
    } else {
        Ok(invalid_login_response())
    }
}

/// Request body for create user route
#[derive(Serialize, Deserialize)]
struct CreateRequest {
    #[serde(default)]
    root: Option<ObjectId>,
    email: String,
    password: String,
    device: String,
}

/// Response body for create user route
#[derive(Serialize, Deserialize)]
struct CreateResponse {
    id: ObjectId,
    email: String,
    root: ObjectId,
    token: ObjectId,
}

/// Create user route
#[route]
pub async fn create_route(
    state: State<ServerState>,
    Json(body): Json<CreateRequest>,
) -> Result<Response> {
    info!("/basil/v2/user/create");
    let timestamp = DateTime::now();

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

    // Create a root folder for the user
    let root = if let Some(uuid) = body.root {
        Folder::new_with_id(uuid, String::new(), None, timestamp)
    } else {
        Folder::new(String::new(), None, timestamp)
    };
    state
        .database
        .insert(DatabaseHandle::Basil, root.clone())
        .await?;
    debug!("Root: {:?}", root);

    // Create the user model
    let hashed_password = utils::hash_password(body.password)?;
    let user = User::new(
        body.email,
        hashed_password,
        root._id,
        body.device,
        timestamp,
    );
    debug!("User: {:?}", user);

    // Insert the user model into the database
    state
        .database
        .insert(DatabaseHandle::Basil, user.clone())
        .await?;
    info!("Created new user {} ({})", user.email, user._id);

    // Generate a new token for the user
    let token = utils::generate_token(&state.database, user._id, timestamp).await?;
    debug!("Token: {:?}", token);

    let response = CreateResponse {
        id: user._id,
        email: user.email,
        root: user.root,
        token: token._id,
    };
    Ok(Json(response).into_response())
}

/// Request body for delete user route
#[derive(Serialize, Deserialize)]
struct DeleteRequest {
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
        if !utils::verify_password(body.password, &user.password) {
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
struct PingRequest {
    #[serde(flatten)]
    authentication: AuthenticationFields,
}

/// Response body for ping route
#[derive(Serialize, Deserialize)]
struct PingResponse {
    actions: Vec<Action>,
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
        utils::validate_user_token(&state.database, &body.authentication).await?
    {
        // Bump the expiration time of the token
        let update = doc! {
            "$set": doc! { "expiration": Token::expiration(timestamp) }
        };
        state
            .database
            .update_one::<Token>(DatabaseHandle::Basil, doc! { "_id": token.id() }, update)
            .await?;

        // Store the time that the user pinged from this device
        let previous_timestamp = user.device_pinged(body.authentication.device, timestamp);
        // Find all actions that have occurred since the device last pinged the server
        let actions = user.actions_since(previous_timestamp);
        // Store the updated user
        state
            .database
            .replace_one(DatabaseHandle::Basil, user)
            .await?;

        let response = PingResponse { actions };
        Ok(Json(response).into_response())
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

/// Get user route
#[route]
async fn get_route(state: State<ServerState>, Path(id): Path<String>) -> Result<Response> {
    info!("/basil/v2/user/{}", id);

    let user_id = ObjectId::parse_str(&id)?;
    debug!("DEBUG: query user ID: {}", user_id);
    if let Some(user) = state
        .database
        .find_one_by_id::<User>(DatabaseHandle::Basil, user_id)
        .await?
    {
        Ok(Json(user).into_response())
    } else {
        Ok((StatusCode::BAD_REQUEST, format!("Invalid user ID: {}", id)).into_response())
    }
}

pub fn router(state: ServerState) -> Router {
    Router::new()
        .route("/authenticate", post(authenticate_route))
        .route("/create", post(create_route))
        .route("/delete", post(delete_route))
        .route("/ping", post(ping_route))
        .route("/{id}", get(get_route))
        .with_state(state)
}
