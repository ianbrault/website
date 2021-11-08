/*
** models/User.js
*/

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const log = require("../log.js");

var UserSchema = new mongoose.Schema({
    name: String,
    password: String,
});

// create a new user
UserSchema.statics.createUser = function(username, password_plaintext, cb) {
    // encrypt the password
    bcrypt.hash(password_plaintext, 10, (err, hash) => {
        if (err) {
            err = `failed to encrypt password: ${err}`;
            log.log_error(err);
            cb(err);
        } else {
            // create and save the user model
            let model = this.model("User");
            let user = new model({
                username: username,
                password: hash,
            });
            user.save((err) => {
                if (err) {
                    err = `failed to save new user: ${err}`;
                    log.log_error(err);
                }
                cb(err);
            });
        }
    });
};

module.exports = mongoose.model("User", UserSchema);
