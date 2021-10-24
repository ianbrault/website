/*
** routes.js
*/

const express = require("express");
const path = require("path");

const log = require("./log");

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

/* archived sites */

router.get("/archive/bbash18-teaser", (req, res) => {
    log.log("GET /archive/bbash18-teaser");
    sendHTML(res, "bbash18_teaser.html");
});

module.exports = router;
