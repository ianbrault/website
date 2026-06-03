/*
** db/src/server/routes/basil/folder.rs
*/

use super::{user::AuthenticationFields, utils};
use crate::db::{
    DatabaseHandle,
    models::basil::{Action, ActionType, Folder, ItemType},
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
use log::info;
use route_macro::route;
use serde::{Deserialize, Serialize};

/// Request body for create folder route
#[derive(Deserialize, Serialize)]
struct CreateRequest {
    #[serde(flatten)]
    authentication: AuthenticationFields,
    #[serde(default)]
    uuid: Option<ObjectId>,
    name: String,
    parent: ObjectId,
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
        utils::validate_user_token(&state.database, &body.authentication).await?
    {
        // Create the folder
        let folder = if let Some(uuid) = body.uuid {
            Folder::new_with_id(uuid, body.name, Some(body.parent), timestamp)
        } else {
            Folder::new(body.name, Some(body.parent), timestamp)
        };
        state
            .database
            .insert(DatabaseHandle::Basil, folder.clone())
            .await?;

        // Link the folder to its parent
        if let Some(error) = utils::add_subfolders_to_folder(
            &state.database,
            body.parent,
            vec![folder._id],
            timestamp,
        )
        .await?
        {
            return Ok((StatusCode::BAD_REQUEST, error).into_response());
        }

        // Add the folder to the user
        user.folders.push(folder._id);
        // Add the create folder action to the journal
        user.add_action(Action::new(
            timestamp,
            ItemType::Folder,
            ActionType::Create,
            folder._id,
        ));
        // And add the modify parent folder action to the journal
        user.add_action(Action::new(
            timestamp,
            ItemType::Folder,
            ActionType::Modify,
            body.parent,
        ));
        // Track the timestamp as the last ping for this device
        user.device_pinged(body.authentication.device, timestamp);
        // Store the updated user
        state
            .database
            .replace_one(DatabaseHandle::Basil, user)
            .await?;

        Ok(Json(folder).into_response())
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

/// Request body for delete folder route
#[derive(Deserialize, Serialize)]
struct DeleteRequest {
    #[serde(flatten)]
    authentication: AuthenticationFields,
    folder_id: ObjectId,
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
        utils::validate_user_token(&state.database, &body.authentication).await?
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
        if let Some(folder) = state
            .database
            .find_one_by_id::<Folder>(DatabaseHandle::Basil, body.folder_id)
            .await?
            && let Some(parent_id) = folder.parent
            && let Some(mut parent_folder) = state
                .database
                .find_one_by_id::<Folder>(DatabaseHandle::Basil, parent_id)
                .await?
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

        // Track the timestamp as the last ping for this device
        user.device_pinged(body.authentication.device, timestamp);
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
#[derive(Deserialize, Serialize)]
struct ModifyRequest {
    #[serde(flatten)]
    authentication: AuthenticationFields,
    folder_id: ObjectId,
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
        utils::validate_user_token(&state.database, &body.authentication).await?
    {
        // Get the folder
        if let Some(mut folder) = state
            .database
            .find_one_by_id::<Folder>(DatabaseHandle::Basil, body.folder_id)
            .await?
        {
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
            // Track the timestamp as the last ping for this device
            user.device_pinged(body.authentication.device, timestamp);
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

/// Get folder route
#[route]
async fn get_route(state: State<ServerState>, Path(id): Path<String>) -> Result<Response> {
    info!("/basil/v2/folder/{}", id);

    let folder_id = ObjectId::parse_str(&id)?;
    if let Some(folder) = state
        .database
        .find_one_by_id::<Folder>(DatabaseHandle::Basil, folder_id)
        .await?
    {
        Ok(Json(folder).into_response())
    } else {
        Ok((
            StatusCode::BAD_REQUEST,
            format!("Invalid folder ID: {}", id),
        )
            .into_response())
    }
}

pub fn router(state: ServerState) -> Router {
    Router::new()
        .route("/create", post(create_route))
        .route("/delete", post(delete_route))
        .route("/modify", post(modify_route))
        .route("/{id}", get(get_route))
        .with_state(state)
}
