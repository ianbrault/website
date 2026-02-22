/*
** db/src/server/routes/basil/recipe.rs
*/

use super::utils;
use crate::db::{
    DatabaseHandle,
    models::basil::{Action, ActionType, ItemType, Recipe},
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

/// Request body for create recipe route
#[derive(Serialize, Deserialize)]
pub struct CreateRequest {
    user_id: Uuid,
    token_id: Uuid,
    device: String,
    title: String,
    parent: Option<Uuid>,
    ingredients: Vec<String>,
    instructions: Vec<String>,
}

/// Create recipe route
#[route]
async fn create_route(
    state: State<ServerState>,
    Json(body): Json<CreateRequest>,
) -> Result<Response> {
    info!("/basil/v2/recipe/create");
    let timestamp = DateTime::now();

    // Validate the given token
    if let Some((mut user, _)) =
        utils::validate_user_token(&state.database, body.user_id, body.token_id).await?
    {
        // Create the recipe
        let recipe = Recipe::new(
            body.title,
            body.parent,
            body.ingredients,
            body.instructions,
            timestamp,
        );
        state
            .database
            .insert(DatabaseHandle::Basil, recipe.clone())
            .await?;

        // Link the recipe to its parent folder
        if let Some(parent_id) = recipe.parent
            && let Some(mut parent_folder) =
                utils::find_folder_by_id(&state.database, parent_id).await?
        {
            parent_folder.add_recipe(recipe._id, timestamp);
            state
                .database
                .replace_one(DatabaseHandle::Basil, parent_folder)
                .await?;
        }

        // Add the recipe to the user
        user.recipes.push(recipe._id);
        // Add the create recipe action to the journal
        let action = Action::new(timestamp, ItemType::Recipe, ActionType::Create, recipe._id);
        user.add_action(action);
        // And add the modify parent folder action to the journal, if the parent exists
        if let Some(parent_id) = recipe.parent {
            let action = Action::new(timestamp, ItemType::Folder, ActionType::Modify, parent_id);
            user.add_action(action);
        }
        // Track the timestamp as the last ping for this device
        user.device_pinged(body.device, timestamp);
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

/// Request body for delete recipe route
#[derive(Serialize, Deserialize)]
pub struct DeleteRequest {
    user_id: Uuid,
    token_id: Uuid,
    device: String,
    recipe_id: Uuid,
}

/// Delete recipe route
#[route]
async fn delete_route(
    state: State<ServerState>,
    Json(body): Json<DeleteRequest>,
) -> Result<Response> {
    info!("/basil/v2/recipe/delete");
    let timestamp = DateTime::now();

    // Validate the given token
    if let Some((mut user, _)) =
        utils::validate_user_token(&state.database, body.user_id, body.token_id).await?
    {
        // Remove the recipe from the user
        user.remove_recipe(body.recipe_id);
        // Add the delete recipe action to the journal
        let action = Action::new(
            timestamp,
            ItemType::Recipe,
            ActionType::Delete,
            body.recipe_id,
        );
        user.add_action(action);

        // Unlink the recipe from its parent folder
        if let Some(recipe) = utils::find_recipe_by_id(&state.database, body.recipe_id).await?
            && let Some(parent_id) = recipe.parent
            && let Some(mut parent_folder) =
                utils::find_folder_by_id(&state.database, parent_id).await?
        {
            parent_folder.remove_recipe(recipe._id, timestamp);
            state
                .database
                .replace_one(DatabaseHandle::Basil, parent_folder)
                .await?;
            // Add the modify parent folder action to the journal
            let action = Action::new(timestamp, ItemType::Folder, ActionType::Modify, parent_id);
            user.add_action(action);
        }

        // Track the timestamp as the last ping for this device
        user.device_pinged(body.device, timestamp);
        // Store the updated user
        state
            .database
            .replace_one(DatabaseHandle::Basil, user)
            .await?;

        // Remove the recipe from the database
        state
            .database
            .delete_one::<Recipe>(DatabaseHandle::Basil, doc! { "_id": body.recipe_id })
            .await?;

        Ok(StatusCode::OK.into_response())
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

/// Request body for modify recipe route
#[derive(Serialize, Deserialize)]
pub struct ModifyRequest {
    user_id: Uuid,
    token_id: Uuid,
    device: String,
    recipe_id: Uuid,
    title: String,
    ingredients: Vec<String>,
    instructions: Vec<String>,
}

/// Modify recipe route
#[route]
async fn modify_route(
    state: State<ServerState>,
    Json(body): Json<ModifyRequest>,
) -> Result<Response> {
    info!("/basil/v2/recipe/modify");
    let timestamp = DateTime::now();

    // Validate the given token
    if let Some((mut user, _)) =
        utils::validate_user_token(&state.database, body.user_id, body.token_id).await?
    {
        // Get the recipe
        if let Some(mut recipe) = utils::find_recipe_by_id(&state.database, body.recipe_id).await? {
            let recipe_id = recipe._id;

            // Modify the recipe
            recipe.title = body.title;
            recipe.ingredients = body.ingredients;
            recipe.instructions = body.instructions;
            recipe.modified = timestamp;
            // Store the updated recipe
            state
                .database
                .replace_one(DatabaseHandle::Basil, recipe)
                .await?;

            // Add the modify recipe action to the journal
            let action = Action::new(timestamp, ItemType::Recipe, ActionType::Modify, recipe_id);
            user.add_action(action);
            // Track the timestamp as the last ping for this device
            user.device_pinged(body.device, timestamp);
            // Store the updated user
            state
                .database
                .replace_one(DatabaseHandle::Basil, user)
                .await?;

            Ok(StatusCode::OK.into_response())
        } else {
            Ok((
                StatusCode::BAD_REQUEST,
                format!("Invalid recipe {}", body.recipe_id),
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
