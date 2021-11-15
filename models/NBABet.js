/*
** models/NBABet.js
*/

const mongoose = require("mongoose");

var NBABetSchema = new mongoose.Schema({
    date: Date,
    team: String,
    opponent: String,
    line: String,
    odds: Number,
    wager: Number,
    result: {
        type: Number,
        required: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("NBABet", NBABetSchema);
