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

/*
** GET routes
*/

router.get("/", (_, res) => {
    log.log("GET /");
    sendHTML(res, "home.html");
});

router.get("/todo", (_, res) => {
    log.log("GET /todo");
    sendHTML(res, "todo.html");
});

/*
** POST routes
*/

// NOTE: CURRENTLY UNUSED
let res_error = (res, status, message) => {
    log.log_error(message);
    res.status(status).send(message);
}

/* archived sites */

router.get("/archive/bbash18-teaser", (_, res) => {
    log.log("GET /archive/bbash18-teaser");
    sendHTML(res, "bbash18_teaser.html");
});

module.exports = router;

