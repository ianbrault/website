/*
** routes.js
*/

const bcrypt = require("bcrypt");
const express = require("express");
const path = require("path");

const log = require("./log");

const NBABet = require("./models/NBABet");
const User = require("./models/User");

let router = express.Router();

let sendHTML = (res, file) => {
    res.sendFile(file, {
        root: path.resolve(__dirname, "views"),
    });
};

/* GET routes */

router.get("/", (req, res) => {
    log.log("GET /");
    sendHTML(res, "home.html");
});

router.get("/sports/console", (req, res) => {
    log.log("GET /sports/console");
    sendHTML(res, "sports_console.html");
});

/* POST routes */

let res_error = (res, status, message) => {
    log.log_error(message);
    res.status(status).send(message);
}

router.post("/user/register", async (req, res) => {
    log.log("POST /user/register");
    let username = req.body["username"];
    let password_plaintext = req.body["password"];

    let user;
    // check if the user already exists
    try {
        user = await User.findOne({username: username});
    } catch(err) {
        res_error(res, 500, `failed to query users: ${err}`);
    }

    if (user) {
        res_error(res, 400, `user ${username} already exists`);
    } else {
        // create and save the user model
        try {
            let user = await User.createUser(username, password_plaintext);
            log.log(`created new user ${username} ${user["_id"]}`);
            // check for a request to include bets
            if (req.body["includeBets"]) {
                try {
                    let bets = await user.getBets();
                    res.status(200).json({user: user._id, bets: bets});
                } catch(err) {
                    res_error(res, 500, `failed to query bets: ${err}`);
                }
            } else {
                res.status(200).send(user._id);
            }
        } catch(err) {
            res_error(res, 500, err);
        }
    }
});

router.post("/user/login", async (req, res) => {
    log.log("POST /user/login");

    let username = req.body["username"];
    let password_plaintext = req.body["password"];

    let user;
    // find the user by username
    try {
        user = await User.findOne({username: username});
    } catch(err) {
        res_error(res, 500, `failed to query users: ${err}`);
    }

    if (!user) {
        res_error(res, 400, `failed to find user ${username}`);
    } else {
        // compare the passwords
        let match = await bcrypt.compare(password_plaintext, user["password"]);
        if (!match) {
            res_error(res, 400, "passwords do not match");
        } else {
            log.log(`logged in user ${username} ${user["_id"]}`);
            // check for a request to include bets
            if (req.body["includeBets"]) {
                try {
                    let bets = await user.getBets();
                    res.status(200).json({user: user._id, bets: bets});
                } catch(err) {
                    res_error(res, 500, `failed to query bets: ${err}`);
                }
            } else {
                res.status(200).send(user._id);
            }
        }
    }
});

router.post("/bets/nba/add", async (req, res) => {
    log.log("POST /bets/nba/add");

    let date = req.body["date"];
    let bet_type = req.body["bet_type"];
    let team = req.body["team"];
    let opponent = req.body["opponent"];
    let line = req.body["line"];
    let odds = req.body["odds"];
    let wager = req.body["wager"];
    let user = req.body["user"];

    if (line == "ML") {
        line = 0;
    }

    // create and save the bet model
    try {
        let bet = await NBABet.createBet(
            date, bet_type, team, opponent, line, odds, wager, user);
        log.log(`added NBA bet ${bet["_id"]} for user ${user}`);
        res.status(200).json(bet);
    } catch(err) {
        res_error(res, 500, `failed to save bet: ${err}`);
    }
});

router.post("/bets/nba/delete", async (req, res) => {
    log.log("POST /bets/nba/delete");

    let bet_id = req.body["bet_id"];
    // delete the bet model
    try {
        await NBABet.deleteOne({_id: bet_id});
        log.log(`deleted NBA bet ${bet_id}`);
        res.sendStatus(200);
    } catch(err) {
        res_error(res, 500, `failed to delete bet: ${err}`);
    }
});

/* archived sites */

router.get("/archive/bbash18-teaser", (req, res) => {
    log.log("GET /archive/bbash18-teaser");
    sendHTML(res, "bbash18_teaser.html");
});

module.exports = router;
