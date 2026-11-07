/*
** db/src/server/mod.rs
*/

mod routes;

use crate::db::Connection;

use anyhow::Result;
use axum::Router;
use log::info;
use tokio::net::TcpListener;

use std::sync::Arc;

/// Shared state between server routes
#[derive(Clone)]
pub struct ServerState {
    database: Arc<Connection>,
}

/// Run the webserver on the given port
pub async fn run(database: Arc<Connection>, port: u32) -> Result<()> {
    let state = ServerState {
        database: database.clone(),
    };
    let app = Router::new().nest("/basil", routes::basil::router(state));

    let address = format!("0.0.0.0:{}", port);
    info!("Server running on {}", address);
    let listener = TcpListener::bind(address).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
