/*
** db/src/server/routes/basil/mod.rs
*/

mod folder;
mod recipe;
mod user;
mod utils;

use crate::server::ServerState;

use axum::Router;

pub fn router(state: ServerState) -> Router {
    Router::new()
        .nest("/v2/folder", folder::router(state.clone()))
        .nest("/v2/recipe", recipe::router(state.clone()))
        .nest("/v2/user", user::router(state))
}
