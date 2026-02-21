/*
** db/src/server/routes/basil/utils.rs
*/

use crate::db::{
    Connection, DatabaseHandle,
    models::basil::{Folder, Recipe, Token, User},
};

use anyhow::Result;
use bson::{DateTime, doc};
use log::debug;
use scrypt::{
    Scrypt,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};
use uuid::Uuid;

/// Hash a password
pub fn hash_password(password: String) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Scrypt.hash_password(password.as_bytes(), &salt)?;
    Ok(hash.to_string())
}

/// Verify that a password matches the expected hash value
pub fn verify_password(password: String, expected: String) -> bool {
    if let Ok(parsed_hash) = PasswordHash::new(&expected) {
        Scrypt
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    } else {
        false
    }
}

/// Generate a new token for the given user ID and insert it into the database
pub async fn generate_token(database: &Connection, user_id: Uuid) -> Result<Token> {
    let token = Token::new(user_id);
    database
        .insert(DatabaseHandle::Basil, token.clone())
        .await?;
    debug!("Created new token: {:?}", token);
    Ok(token)
}

/// Get a folder given the ID
pub async fn find_folder_by_id(database: &Connection, folder_id: Uuid) -> Result<Option<Folder>> {
    let result = database
        .find_one::<Folder>(DatabaseHandle::Basil, doc! { "_id": folder_id })
        .await?;
    Ok(result)
}

/// Get a recipe given the ID
pub async fn find_recipe_by_id(database: &Connection, recipe_id: Uuid) -> Result<Option<Recipe>> {
    let result = database
        .find_one::<Recipe>(DatabaseHandle::Basil, doc! { "_id": recipe_id })
        .await?;
    Ok(result)
}

/// Get the user and token matching the given IDs from the database, verify that they are linked to
/// one another, and verify that the token has not expired
pub async fn validate_user_token(
    database: &Connection,
    user_id: Uuid,
    token_id: Uuid,
) -> Result<Option<(User, Token)>> {
    if let Some(user) = database
        .find_one::<User>(DatabaseHandle::Basil, doc! { "_id": &user_id })
        .await?
        && let Some(token) = database
            .find_one::<Token>(DatabaseHandle::Basil, doc! { "_id": &token_id })
            .await?
    {
        // Verify that the user ID linked to the token matches and that the token has
        // not expired
        if user._id == token.user_id && !token.has_expired() {
            return Ok(Some((user, token)));
        }
    }
    debug!(
        "Invalid token: user: {}: token: {}: now: {}",
        user_id,
        token_id,
        DateTime::now()
    );
    Ok(None)
}
