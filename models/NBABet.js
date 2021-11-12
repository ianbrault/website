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
    result: {
        type: Number,
        required: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

// create a new bet
NBABetSchema.statics.createBet = async function(date, bet_type, team, opponent, line, odds, wager, user) {
    // create and save the bet model
    let model = this.model("NBABet");
    let bet = new model({
        date: date,
        bet_type: bet_type,
        team: team,
        opponent: opponent,
        line: line,
        odds: odds,
        wager: wager,
        user: user,
    });
    await bet.save();
    return bet;
};

module.exports = mongoose.model("NBABet", NBABetSchema);
