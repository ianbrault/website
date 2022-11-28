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

router.get("/projects", (_, res) => {
    log.log("GET /projects");
    sendHTML(res, "projects.html");
});

router.get("/todo", (_, res) => {
    log.log("GET /todo");
    sendHTML(res, "todo.html");
});

router.get("/sleeper", (_, res) => {
    log.log("GET /sleeper");
    sendHTML(res, "sleeper.html");
});

/* archived sites */

router.get("/archive/bbash18-teaser", (_, res) => {
    log.log("GET /archive/bbash18-teaser");
    sendHTML(res, "bbash18_teaser.html");
});

router.get("/archive/faroutfest", (_, res) => {
    log.log("GET /archive/faroutfest");
    sendHTML(res, "faroutfest.html");
});

router.get("/archive/faroutfest/faq", (_, res) => {
    log.log("GET /archive/faroutfest/faq");
    sendHTML(res, "faroutfest_faq.html");
});

module.exports = router;

