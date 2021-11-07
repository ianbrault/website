/*
** models/NBABet.js
*/

const mongoose = require("mongoose");

var NBABetSchema = new mongoose.Schema({
    date: Date,
    bet_type: String,
    team: String,
    opponent: String,
    line: Number,
    odds: Number,
    wager: Number,
    result: Number,
});

module.exports = mongoose.model("NBABet", NBABetSchema);
