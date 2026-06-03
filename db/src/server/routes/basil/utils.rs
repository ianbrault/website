/*
** db/src/server/routes/basil/utils.rs
*/

use super::user::AuthenticationFields;
use crate::db::{
    Connection, DatabaseHandle,
    models::basil::{Folder, Token, User},
};

use anyhow::Result;
use bson::{DateTime, oid::ObjectId};
use log::{debug, warn};
use scrypt::{
    Scrypt,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};

/// Hash a password
pub fn hash_password(password: String) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Scrypt.hash_password(password.as_bytes(), &salt)?;
    Ok(hash.to_string())
}

/// Verify that a password matches the expected hash value
pub fn verify_password(password: String, expected: &str) -> bool {
    if let Ok(parsed_hash) = PasswordHash::new(expected) {
        Scrypt
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    } else {
        false
    }
}

/// Generate a new token for the given user ID and insert it into the database
pub async fn generate_token(
    database: &Connection,
    user_id: ObjectId,
    timestamp: DateTime,
) -> Result<Token> {
    let token = Token::new(user_id, timestamp);
    database
        .insert(DatabaseHandle::Basil, token.clone())
        .await?;
    debug!("Created new token: {:?}", token);
    Ok(token)
}

/// Add recipes to a folder given its ID and store the updated folder to the database
pub async fn add_recipes_to_folder(
    database: &Connection,
    folder_id: ObjectId,
    recipes: Vec<ObjectId>,
    timestamp: DateTime,
) -> Result<Option<String>> {
    if let Some(mut folder) = database
        .find_one_by_id::<Folder>(DatabaseHandle::Basil, folder_id)
        .await?
    {
        folder.add_recipes(recipes, timestamp);
        database.replace_one(DatabaseHandle::Basil, folder).await?;
        Ok(None)
    } else {
        Ok(Some(format!("Invalid folder ID {}", folder_id)))
    }
}

/// Add subfolders to a folder given its ID and store the updated folder to the database
/// If the parent could not be found, an error string is returned as Ok
pub async fn add_subfolders_to_folder(
    database: &Connection,
    folder_id: ObjectId,
    subfolders: Vec<ObjectId>,
    timestamp: DateTime,
) -> Result<Option<String>> {
    if let Some(mut folder) = database
        .find_one_by_id::<Folder>(DatabaseHandle::Basil, folder_id)
        .await?
    {
        folder.add_subfolders(subfolders, timestamp);
        database.replace_one(DatabaseHandle::Basil, folder).await?;
        Ok(None)
    } else {
        Ok(Some(format!("Invalid folder ID {}", folder_id)))
    }
}

/// Get the user and token matching the given IDs from the database, verify that they are linked to
/// one another, and verify that the token has not expired
pub async fn validate_user_token(
    database: &Connection,
    authentication: &AuthenticationFields,
) -> Result<Option<(User, Token)>> {
    debug!(
        "Validating token {} for user {}",
        authentication.token_id, authentication.user_id
    );
    let now = DateTime::now();

    if let Some(user) = database
        .find_one_by_id::<User>(DatabaseHandle::Basil, authentication.user_id)
        .await?
    {
        if let Some(token) = database
            .find_one_by_id::<Token>(DatabaseHandle::Basil, authentication.token_id)
            .await?
        {
            // Verify that the user ID linked to the token matches and that the token has
            // not expired
            if user._id != token.user_id {
                warn!(
                    "Token user does not match the given user ID: user ID: {}: token user: {}",
                    user._id, token.user_id
                );
            } else if token.has_expired() {
                warn!(
                    "Token has expired: token expiration: {}: now: {}",
                    token.expiration, now
                );
            } else {
                return Ok(Some((user, token)));
            }
        } else {
            warn!("Failed to find token for ID: {}", authentication.token_id);
        }
    } else {
        warn!("Failed to find user for ID: {}", authentication.user_id);
    }
    debug!(
        "Invalid token: user: {}: token: {}: now: {}",
        authentication.user_id, authentication.token_id, now
    );
    Ok(None)
}
