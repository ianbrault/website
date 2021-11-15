/*
** routes.js
*/

const bcrypt = require("bcrypt");
const express = require("express");
const path = require("path");

const log = require("./log");

const NBABet = require("./models/NBABet");
const NCAAFBet = require("./models/NCAAFBet");
const NCAAMBBBet = require("./models/NCAAMBBBet");
const NFLBet = require("./models/NFLBet");
const User = require("./models/User");

let router = express.Router();

let sendHTML = (res, file) => {
    res.sendFile(file, {
        root: path.resolve(__dirname, "views"),
    });
};

/*
** GET routes
*/

router.get("/", (req, res) => {
    log.log("GET /");
    sendHTML(res, "home.html");
});

router.get("/sports/console", (req, res) => {
    log.log("GET /sports/console");
    sendHTML(res, "sports_console.html");
});

/*
** POST routes
*/

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

// create bets
let generic_bet_keys = [
    "date", "team", "opponent", "line", "odds", "wager", "user",
];

function grabKeys(from, keys) {
    let res = {};
    keys.forEach((k) => {
        res[k] = from[k];
    });
    return res;
}

async function createBet(res, sport, model, bet_body) {
    // FIXME: DEBUG START
    log.log(`sport=${sport}; body=${JSON.stringify(bet_body)}`);
    // FIXME: DEBUG END
    let bet = new model(bet_body);
    try {
        await bet.save();
    } catch(err) {
        res_error(res, 500, `failed to save ${sport} bet: ${err}`);
    }
    log.log(`added ${sport} bet ${bet["_id"]} for user ${bet_body["user"]}`);
    res.status(200).json(bet);
}

router.post("/bets/nba/add", async (req, res) => {
    log.log("POST /bets/nba/add");
    let bet_body = grabKeys(req.body, generic_bet_keys);
    await createBet(res, "NBA", NBABet, bet_body);
});

router.post("/bets/ncaaf/add", async (req, res) => {
    log.log("POST /bets/ncaaf/add");
    let bet_body = grabKeys(req.body, generic_bet_keys);
    await createBet(res, "NCAAF", NCAAFBet, bet_body);
});

router.post("/bets/ncaambb/add", async (req, res) => {
    log.log("POST /bets/ncaambb/add");
    let bet_body = grabKeys(req.body, generic_bet_keys);
    await createBet(res, "NCAAMBB", NCAAMBBBet, bet_body);
});

router.post("/bets/nfl/add", async (req, res) => {
    log.log("POST /bets/nfl/add");
    let bet_body = grabKeys(req.body, generic_bet_keys);
    await createBet(res, "NFL", NFLBet, bet_body);
});

// delete bets

async function deleteBet(res, sport, model, bet_id) {
    try {
        await model.deleteOne({_id: bet_id});
        log.log(`deleted ${sport} bet ${bet_id}`);
        res.sendStatus(200);
    } catch(err) {
        res_error(res, 500, `failed to delete ${sport} bet ${bet_id}: ${err}`);
    }
}

router.post("/bets/nba/delete", async (req, res) => {
    log.log("POST /bets/nba/delete");
    await deleteBet(res, "NBA", NBABet, req.body["bet_id"]);
});

router.post("/bets/ncaaf/delete", async (req, res) => {
    log.log("POST /bets/ncaaf/delete");
    await deleteBet(res, "NCAAF", NCAAFBet, req.body["bet_id"]);
});

router.post("/bets/ncaambb/delete", async (req, res) => {
    log.log("POST /bets/ncaambb/delete");
    await deleteBet(res, "NCAAMBB", NCAAMBBBet, req.body["bet_id"]);
});

router.post("/bets/nfl/delete", async (req, res) => {
    log.log("POST /bets/nfl/delete");
    await deleteBet(res, "NFL", NFLBet, req.body["bet_id"]);
});

/* archived sites */

router.get("/archive/bbash18-teaser", (req, res) => {
    log.log("GET /archive/bbash18-teaser");
    sendHTML(res, "bbash18_teaser.html");
});

module.exports = router;
