/*
** models/User.js
*/

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const NBABet = require("./NBABet.js");

var UserSchema = new mongoose.Schema({
    name: String,
    password: String,
});

// create a new user
UserSchema.statics.createUser = async function(username, password_plaintext) {
    // encrypt the password
    let hash = await bcrypt.hash(password_plaintext, 10);
    // create and save the user model
    let model = this.model("User");
    let user = new model({
        username: username,
        password: hash,
    });
    await user.save();
    return user;
};

// get all NBA bets for the user
UserSchema.methods.getNBABets = async function() {
    return await NBABet.find({user: this._id});
}

// get all bets for all sports for the user
UserSchema.methods.getBets = async function() {
    return {
        "NBA": await this.getNBABets(),
    }
}

module.exports = mongoose.model("User", UserSchema);
