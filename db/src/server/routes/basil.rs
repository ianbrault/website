/*
** db/src/server/routes/basil.rs
*/

use crate::db::{
    DatabaseHandle,
    models::basil::{Token, User},
};
use crate::server::{ErrorResponse, ServerState};
use crate::utils;

use axum::{
    Json, Router,
    extract::State,
    response::{IntoResponse, Response},
    routing::post,
};
use bson::doc;
use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Request body for create_user route
#[derive(Serialize, Deserialize)]
struct CreateUserBody {
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

/// Response body for create_user route
#[derive(Serialize, Deserialize)]
struct CreateUserResponse {
    id: Uuid,
    email: String,
    root: Uuid,
    recipes: Vec<Uuid>,
    folders: Vec<Uuid>,
    sequence: usize,
    token: Uuid,
}

async fn create_user(state: State<ServerState>, Json(body): Json<CreateUserBody>) -> Response {
    info!("/basil/v2/user/create");
    let token_collection = state.database.collection::<Token>(DatabaseHandle::Basil);
    let user_collection = state.database.collection::<User>(DatabaseHandle::Basil);

    // Check for a pre-existing user with the same email
    match user_collection
        .find_one(doc! { "email": &body.email })
        .await
    {
        Ok(maybe_user) => {
            if maybe_user.is_some() {
                info!("A user with email {} already exists", body.email);
                return ErrorResponse::bad_request(format!(
                    "A user with email \"{}\" already exists",
                    body.email
                ))
                .into_response();
            }
        }
        Err(error) => {
            error!("Failed to query for duplicate users: {}", error.to_string());
            return ErrorResponse::internal_error(error.into()).into_response();
        }
    };

    // Create the user model
    let hashed_password = match utils::hash_password(body.password) {
        Ok(hash) => hash,
        Err(error) => {
            error!("Failed to hash password: {}", error.to_string());
            return ErrorResponse::internal_error(error).into_response();
        }
    };
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
    debug!("New user: {:?}", user);

    // Create a token for the user before inserting the user model
    let token = Token::new(user._id);
    debug!("New token for user: {:?}", token);
    let token_id = token._id;
    if let Err(error) = token_collection.insert_one(token).await {
        error!("Failed to insert new token: {}", error.to_string());
        return ErrorResponse::internal_error(error.into()).into_response();
    }

    // Insert the user model and return the details in the response
    match user_collection.insert_one(user.clone()).await {
        Ok(_) => {
            info!("Created new user {}", user._id);
            let response = CreateUserResponse {
                id: user._id,
                email: user.email,
                root: user.root,
                recipes: user.recipes,
                folders: user.folders,
                sequence: user.sequence,
                token: token_id,
            };
            Json(response).into_response()
        }
        Err(error) => {
            error!("Failed to insert new user: {}", error.to_string());
            ErrorResponse::internal_error(error.into()).into_response()
        }
    }
}

pub fn router(state: ServerState) -> Router {
    Router::new()
        .route("/v2/user/create", post(create_user))
        .with_state(state)
}
