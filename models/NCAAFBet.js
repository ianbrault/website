/*
** models/NCAAF.js
*/

const mongoose = require("mongoose");

var NCAAFBetSchema = new mongoose.Schema({
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

module.exports = mongoose.model("NCAAFBet", NCAAFBetSchema);
