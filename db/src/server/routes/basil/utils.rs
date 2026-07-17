/*
** db/src/server/routes/basil/utils.rs
*/

use super::user::AuthenticationFields;
use crate::db::{
    Connection, DatabaseHandle,
    models::basil::{Action, ActionType, Folder, ItemType, Recipe, Token, User},
};

use anyhow::Result;
use bson::{DateTime, doc, oid::ObjectId};
use log::{debug, warn};
use scrypt::{
    Scrypt,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};

use std::boxed::Box;

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

/// Delete the given folders from the provided user and from the database. Recursively deletes
/// recipes and subfolders inside the given folders. Note that this does not store the updated user
/// to the database, though
pub async fn delete_folders(
    database: &Connection,
    user: &mut User,
    folders: &[ObjectId],
    timestamp: DateTime,
) -> Result<()> {
    for folder_id in folders {
        // Remove the folder from the user
        user.remove_folder(*folder_id);
        // Add the delete folder action to the journal
        let action = Action::new(timestamp, ItemType::Folder, ActionType::Delete, *folder_id);
        user.add_action(action);

        if let Some(folder) = database
            .find_one_by_id::<Folder>(DatabaseHandle::Basil, *folder_id)
            .await?
        {
            // Unlink the folder from its parent folder
            if let Some(parent_id) = folder.parent
                && let Some(mut parent_folder) = database
                    .find_one_by_id::<Folder>(DatabaseHandle::Basil, parent_id)
                    .await?
            {
                parent_folder.remove_subfolder(folder._id, timestamp);
                database
                    .replace_one(DatabaseHandle::Basil, parent_folder)
                    .await?;
                // Add the modify parent folder action to the journal
                let action =
                    Action::new(timestamp, ItemType::Folder, ActionType::Modify, parent_id);
                user.add_action(action);
            }

            // Remove all recipes and subfolders
            delete_recipes(database, user, &folder.recipes, timestamp).await?;
            Box::pin(delete_folders(
                database,
                user,
                &folder.subfolders,
                timestamp,
            ))
            .await?;
        }

        // Remove the folder from the database
        database
            .delete_one::<Folder>(DatabaseHandle::Basil, doc! { "_id": folder_id })
            .await?;
    }

    Ok(())
}

/// Delete the given recipes from the provided user and from the database. Note that this does not
/// store the updated user to the database, though
pub async fn delete_recipes(
    database: &Connection,
    user: &mut User,
    recipes: &[ObjectId],
    timestamp: DateTime,
) -> Result<()> {
    for recipe_id in recipes {
        // Remove the recipe from the user
        user.remove_recipe(*recipe_id);
        // Add the delete recipe action to the journal
        let action = Action::new(timestamp, ItemType::Recipe, ActionType::Delete, *recipe_id);
        user.add_action(action);

        // Unlink the recipe from its parent folder
        if let Some(recipe) = database
            .find_one_by_id::<Recipe>(DatabaseHandle::Basil, *recipe_id)
            .await?
            && let Some(parent_id) = recipe.parent
            && let Some(mut parent_folder) = database
                .find_one_by_id::<Folder>(DatabaseHandle::Basil, parent_id)
                .await?
        {
            parent_folder.remove_recipe(recipe._id, timestamp);
            database
                .replace_one(DatabaseHandle::Basil, parent_folder)
                .await?;
            // Add the modify parent folder action to the journal
            let action = Action::new(timestamp, ItemType::Folder, ActionType::Modify, parent_id);
            user.add_action(action);
        }

        // Remove the folder from the database
        database
            .delete_one::<Folder>(DatabaseHandle::Basil, doc! { "_id": recipe_id })
            .await?;
    }

    Ok(())
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
