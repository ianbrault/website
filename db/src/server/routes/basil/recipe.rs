/*
** db/src/server/routes/basil/recipe.rs
*/

use super::{user::AuthenticationFields, utils};
use crate::db::{
    DatabaseHandle,
    models::basil::{Action, ActionType, ItemType, Recipe},
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

/// Request body for create recipe route
#[derive(Deserialize, Serialize)]
struct CreateRequest {
    #[serde(flatten)]
    authentication: AuthenticationFields,
    #[serde(default)]
    uuid: Option<ObjectId>,
    title: String,
    parent: ObjectId,
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
        utils::validate_user_token(&state.database, &body.authentication).await?
    {
        // Create the recipe
        let recipe = if let Some(uuid) = body.uuid {
            Recipe::new_with_id(
                uuid,
                body.title,
                Some(body.parent),
                body.ingredients,
                body.instructions,
                timestamp,
            )
        } else {
            Recipe::new(
                body.title,
                Some(body.parent),
                body.ingredients,
                body.instructions,
                timestamp,
            )
        };
        state
            .database
            .insert(DatabaseHandle::Basil, recipe.clone())
            .await?;
        info!("Created recipe \"{}\" (ID: {})", recipe.title, recipe._id);
        debug!("{:?}", recipe);

        // Link the recipe to its parent
        if let Some(error) =
            utils::add_recipes_to_folder(&state.database, body.parent, vec![recipe._id], timestamp)
                .await?
        {
            return Ok((StatusCode::BAD_REQUEST, error).into_response());
        }

        // Add the recipe to the user
        user.recipes.push(recipe._id);
        // Add the create recipe action to the journal
        user.add_action(Action::new(
            timestamp,
            ItemType::Recipe,
            ActionType::Create,
            recipe._id,
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

        Ok(Json(recipe).into_response())
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

/// Request body for delete recipe route
#[derive(Deserialize, Serialize)]
struct DeleteRequest {
    #[serde(flatten)]
    authentication: AuthenticationFields,
    recipe_id: ObjectId,
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
        utils::validate_user_token(&state.database, &body.authentication).await?
    {
        let recipes = vec![body.recipe_id];
        utils::delete_recipes(&state.database, &mut user, &recipes, timestamp).await?;

        // Track the timestamp as the last ping for this device
        user.device_pinged(body.authentication.device, timestamp);
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

/// Request body for modify recipe route
#[derive(Deserialize, Serialize)]
struct ModifyRequest {
    #[serde(flatten)]
    authentication: AuthenticationFields,
    recipe_id: ObjectId,
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
        utils::validate_user_token(&state.database, &body.authentication).await?
    {
        // Get the recipe
        if let Some(mut recipe) = state
            .database
            .find_one_by_id::<Recipe>(DatabaseHandle::Basil, body.recipe_id)
            .await?
        {
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
                format!("Invalid recipe {}", body.recipe_id),
            )
                .into_response())
        }
    } else {
        Ok((StatusCode::BAD_REQUEST, "Invalid token".to_string()).into_response())
    }
}

/// Get recipe route
#[route]
async fn get_route(state: State<ServerState>, Path(id): Path<String>) -> Result<Response> {
    info!("/basil/v2/recipe/{}", id);

    let recipe_id = ObjectId::parse_str(&id)?;
    if let Some(recipe) = state
        .database
        .find_one_by_id::<Recipe>(DatabaseHandle::Basil, recipe_id)
        .await?
    {
        Ok(Json(recipe).into_response())
    } else {
        Ok((
            StatusCode::BAD_REQUEST,
            format!("Invalid recipe ID: {}", id),
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
