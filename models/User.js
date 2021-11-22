/*
** models/User.js
*/

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const F1Bet = require("./F1Bet");
const NBABet = require("./NBABet");
const NCAAFBet = require("./NCAAFBet");
const NCAAMBBBet = require("./NCAAMBBBet");
const NFLBet = require("./NFLBet");

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

// get all F1 bets for the user
UserSchema.methods.getF1Bets = async function() {
    return await F1Bet.find({user: this._id});
}

// get all NBA bets for the user
UserSchema.methods.getNBABets = async function() {
    return await NBABet.find({user: this._id});
}

// get all NCAAF bets for the user
UserSchema.methods.getNCAAFBets = async function() {
    return await NCAAFBet.find({user: this._id});
}

// get all NCAAMBB bets for the user
UserSchema.methods.getNCAAMBBBets = async function() {
    return await NCAAMBBBet.find({user: this._id});
}

// get all NFL bets for the user
UserSchema.methods.getNFLBets = async function() {
    return await NFLBet.find({user: this._id});
}

// get all bets for all sports for the user
UserSchema.methods.getBets = async function() {
    return {
        "F1": await this.getF1Bets(),
        "NBA": await this.getNBABets(),
        "NCAAF": await this.getNCAAFBets(),
        "NCAAMBB": await this.getNCAAMBBBets(),
        "NFL": await this.getNFLBets(),
    }
}

module.exports = mongoose.model("User", UserSchema);
