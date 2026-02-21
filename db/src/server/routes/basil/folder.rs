/*
** db/src/server/routes/basil/folder.rs
*/

use super::utils;
use crate::db::{
    DatabaseHandle,
    models::basil::{Action, ActionType, Folder, ItemType},
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
use log::info;
use route_macro::route;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Request body for create folder route
#[derive(Serialize, Deserialize)]
pub struct CreateRequest {
    user_id: Uuid,
    token_id: Uuid,
    device: String,
    name: String,
    parent: Option<Uuid>,
}

/// Create folder route
#[route]
async fn create_route(
    state: State<ServerState>,
    Json(body): Json<CreateRequest>,
) -> Result<Response> {
    info!("/basil/v2/folder/create");
    let timestamp = DateTime::now();

    // Validate the given token
    if let Some((mut user, _)) =
        utils::validate_user_token(&state.database, body.user_id, body.token_id).await?
    {
        // Create the folder
        let folder = Folder::new(body.name, body.parent, timestamp);
        state
            .database
            .insert(DatabaseHandle::Basil, folder.clone())
            .await?;

        // Link the folder to its parent
        if let Some(parent_id) = folder.parent
            && let Some(mut parent_folder) =
                utils::find_folder_by_id(&state.database, parent_id).await?
        {
            parent_folder.add_subfolder(folder._id, timestamp);
            state
                .database
                .replace_one(DatabaseHandle::Basil, parent_folder)
                .await?;
        }

        // Add the folder to the user
        user.folders.push(folder._id);
        // Add the create folder action to the journal
        let action = Action::new(timestamp, ItemType::Folder, ActionType::Create, folder._id);
        user.add_action(action);
        // And add the modify parent folder action to the journal, if the parent exists
        if let Some(parent_id) = folder.parent {
            let action = Action::new(timestamp, ItemType::Folder, ActionType::Modify, parent_id);
            user.add_action(action);
        }
        // Store the updated user
        state
            .database
            .replace_one(DatabaseHandle::Basil, user)
            .await?;

        Ok(StatusCode::OK.into_response())
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

/// Request body for delete folder route
#[derive(Serialize, Deserialize)]
pub struct DeleteRequest {
    user_id: Uuid,
    token_id: Uuid,
    folder_id: Uuid,
}

/// Delete folder route
#[route]
async fn delete_route(
    state: State<ServerState>,
    Json(body): Json<DeleteRequest>,
) -> Result<Response> {
    info!("/basil/v2/folder/delete");
    let timestamp = DateTime::now();

    // Validate the given token
    if let Some((mut user, _)) =
        utils::validate_user_token(&state.database, body.user_id, body.token_id).await?
    {
        // Remove the folder from the user
        user.remove_folder(body.folder_id);
        // Add the delete folder action to the journal
        let action = Action::new(
            timestamp,
            ItemType::Folder,
            ActionType::Delete,
            body.folder_id,
        );
        user.add_action(action);

        // Unlink the folder from its parent folder
        if let Some(folder) = utils::find_folder_by_id(&state.database, body.folder_id).await?
            && let Some(parent_id) = folder.parent
            && let Some(mut parent_folder) =
                utils::find_folder_by_id(&state.database, parent_id).await?
        {
            parent_folder.remove_subfolder(folder._id, timestamp);
            state
                .database
                .replace_one(DatabaseHandle::Basil, parent_folder)
                .await?;
            // Add the modify parent folder action to the journal
            let action = Action::new(timestamp, ItemType::Folder, ActionType::Modify, parent_id);
            user.add_action(action);
        }

        // Store the updated user
        state
            .database
            .replace_one(DatabaseHandle::Basil, user)
            .await?;

        // Remove the folder from the database
        state
            .database
            .delete_one::<Folder>(DatabaseHandle::Basil, doc! { "_id": body.folder_id })
            .await?;

        Ok(StatusCode::OK.into_response())
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

/// Request body for modify folder route
#[derive(Serialize, Deserialize)]
pub struct ModifyRequest {
    user_id: Uuid,
    token_id: Uuid,
    folder_id: Uuid,
    name: String,
}

/// Modify folder route
#[route]
async fn modify_route(
    state: State<ServerState>,
    Json(body): Json<ModifyRequest>,
) -> Result<Response> {
    info!("/basil/v2/folder/modify");
    let timestamp = DateTime::now();

    // Validate the given token
    if let Some((mut user, _)) =
        utils::validate_user_token(&state.database, body.user_id, body.token_id).await?
    {
        // Get the folder
        if let Some(mut folder) = utils::find_folder_by_id(&state.database, body.folder_id).await? {
            let folder_id = folder._id;

            // Modify the folder
            folder.name = body.name;
            folder.modified = timestamp;
            // Store the updated folder
            state
                .database
                .replace_one(DatabaseHandle::Basil, folder)
                .await?;

            // Add the modify folder action to the journal
            let action = Action::new(timestamp, ItemType::Folder, ActionType::Modify, folder_id);
            user.add_action(action);
            // Store the updated user
            state
                .database
                .replace_one(DatabaseHandle::Basil, user)
                .await?;

            Ok(StatusCode::OK.into_response())
        } else {
            Ok((
                StatusCode::BAD_REQUEST,
                format!("Invalid folder {}", body.folder_id),
            )
                .into_response())
        }
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

pub fn router(state: ServerState) -> Router {
    Router::new()
        .route("/create", post(create_route))
        .route("/delete", post(delete_route))
        .route("/modify", post(modify_route))
        .with_state(state)
}
