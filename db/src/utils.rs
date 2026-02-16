/*
** db/src/utils.rs
*/

use anyhow::Result;
use scrypt::{
    Scrypt,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};

/// Hash a password using scrypt
pub fn hash_password(password: String) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Scrypt.hash_password(password.as_bytes(), &salt)?;
    Ok(hash.to_string())
}

/// Verify that a password matches the expected hash value using scrypt
pub fn verify_password(password: String, expected: String) -> bool {
    if let Ok(parsed_hash) = PasswordHash::new(&expected) {
        Scrypt
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    } else {
        false
    }
}
