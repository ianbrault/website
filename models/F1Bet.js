/*
** models/F1Bet.js
*/

const mongoose = require("mongoose");

var F1BetSchema = new mongoose.Schema({
    date: Date,
    driver: String,
    event: String,
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

module.exports = mongoose.model("F1Bet", F1BetSchema);

