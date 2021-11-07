/*
** models/User.js
*/

const mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    name: String,
    password: String,
});

module.exports = mongoose.model("User", UserSchema);
