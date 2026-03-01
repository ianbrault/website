/*
** db/src/server/routes/basil/query.rs
*/

use super::utils;
use crate::db::models::basil::{Folder, Recipe};
use crate::server::ServerState;

use anyhow::{Error, Result};
use axum::{
    Json, Router,
    extract::State,
    response::{IntoResponse, Response},
    routing::post,
};
use bson::doc;
use futures::future;
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

async fn join_queries<T, I, F>(queries: I) -> Vec<T>
where
    I: Iterator<Item = F>,
    F: Future<Output = Result<Option<T>, Error>>,
{
    future::join_all(queries)
        .await
        .into_iter()
        .filter_map(|f| f.unwrap_or_default())
        .collect()
}

/// Query route
#[route]
async fn query_route(
    state: State<ServerState>,
    Json(body): Json<QueryRequest>,
) -> Result<Response> {
    info!("/basil/v2/query");

    // Query recipes and folders, handling any errors gracefully
    let recipe_queries = body
        .recipes
        .into_iter()
        .map(|recipe_id| utils::find_recipe_by_id(&state.database, recipe_id));
    let folder_queries = body
        .folders
        .into_iter()
        .map(|folder_id| utils::find_folder_by_id(&state.database, folder_id));
    let recipes = join_queries(recipe_queries).await;
    let folders = join_queries(folder_queries).await;

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
