/*
** db/src/main.rs
*/

mod db;
mod server;
mod utils;

use anyhow::Result;
use clap::Parser;
use log::error;
use simplelog::{LevelFilter, TermLogger};

use std::sync::Arc;

#[derive(Parser)]
#[command(version)]
struct Args {
    /// Server port
    #[arg(short, long, env = "PORT")]
    port: u32,
    /// MongoDB connection URL
    #[arg(
        short,
        long,
        env = "MONGODB_URL",
        default_value = "mongodb://127.0.0.1:27017"
    )]
    mongodb_url: String,
    /// Enable debug output
    #[arg(short, long)]
    debug: bool,
}

fn setup_logger(debug: bool) -> Result<()> {
    let log_level = if debug {
        LevelFilter::Debug
    } else {
        LevelFilter::Info
    };
    TermLogger::init(
        log_level,
        simplelog::Config::default(),
        simplelog::TerminalMode::Stdout,
        simplelog::ColorChoice::Auto,
    )?;
    Ok(())
}

async fn main_inner(args: Args) -> Result<()> {
    // Initialize the logger
    setup_logger(args.debug)?;

    // Connect to the database
    let database = Arc::new(db::Connection::new(args.mongodb_url).await?);

    // Run the webserver
    server::run(database, args.port).await?;

    // TODO: set up a periodic task to clear out expired tokens

    Ok(())
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    if let Err(e) = main_inner(args).await {
        error!("{}", e);
    }
}
