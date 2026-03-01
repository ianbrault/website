/*
** db/src/server/routes/basil/query.rs
*/

use super::utils;
use crate::db::models::basil::{Folder, Recipe};
use crate::server::ServerState;

use anyhow::Result;
use axum::{
    Json, Router,
    extract::State,
    response::{IntoResponse, Response},
    routing::post,
};
use bson::doc;
use log::info;
use route_macro::route;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Request body for query route
#[derive(Serialize, Deserialize)]
pub struct QueryRequest {
    recipes: Vec<Uuid>,
    folders: Vec<Uuid>,
}

/// Response body for query route
#[derive(Serialize, Deserialize)]
pub struct QueryResponse {
    count: usize,
    recipes: Vec<Recipe>,
    folders: Vec<Folder>,
}

/// Query route
#[route]
async fn query_route(
    state: State<ServerState>,
    Json(body): Json<QueryRequest>,
) -> Result<Response> {
    info!("/basil/v2/query");

    // Query recipes and folders, handling any errors gracefully
    let mut recipes = Vec::with_capacity(body.recipes.len());
    for recipe_id in body.recipes {
        if let Ok(Some(recipe)) = utils::find_recipe_by_id(&state.database, recipe_id).await {
            recipes.push(recipe);
        }
    }
    let mut folders = Vec::with_capacity(body.folders.len());
    for folder_id in body.folders {
        if let Ok(Some(folder)) = utils::find_folder_by_id(&state.database, folder_id).await {
            folders.push(folder);
        }
    }

    let response = QueryResponse {
        count: recipes.len() + folders.len(),
        recipes,
        folders,
    };
    Ok(Json(response).into_response())
}

pub fn router(state: ServerState) -> Router {
    Router::new()
        .route("/", post(query_route))
        .with_state(state)
}
