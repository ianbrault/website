/*
** db/src/server/mod.rs
*/

mod routes;

use crate::db::Connection;

use anyhow::{Error, Result};
use axum::{
    Router,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use log::info;
use tokio::net::TcpListener;

use std::sync::Arc;

/// Shared state between server routes
#[derive(Clone)]
pub struct ServerState {
    database: Arc<Connection>,
}

/// Represents an error response
pub struct ErrorResponse {
    status_code: StatusCode,
    message: String,
}

impl ErrorResponse {
    fn bad_request(message: impl ToString) -> Self {
        Self {
            status_code: StatusCode::BAD_REQUEST,
            message: message.to_string(),
        }
    }

    fn internal_error(error: Error) -> Self {
        Self {
            status_code: StatusCode::INTERNAL_SERVER_ERROR,
            message: error.to_string(),
        }
    }
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> Response {
        (self.status_code, self.message).into_response()
    }
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
