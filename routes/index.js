/*
 * routes/index.js
 */

const babelify = require("babelify");
const browserify = require("browserify-middleware");
const express = require("express");

const archive = require("./archive");
const groupme = require("./groupme");
const Log = require("../log");

let router = express.Router();

router.use("/archive", archive);
router.use("/groupme", groupme);

router.use("/js", browserify("./src/js", {
    transform: [babelify.configure({
        presets: ["@babel/preset-env"]
    })]
}));

/* GET routes */

router.get("/", (req, res) => {
    Log.log("GET /");
    res.render("home", { title: "ianbrault", page: "home" });
});

router.get("/about", (req, res) => {
    Log.log("GET /about");
    res.render("about", { title: "about", page: "about" });
});

router.get("/portfolio", (req, res) => {
    Log.log("GET /portfolio");
    res.render("portfolio", { title: "portfolio", page: "portfolio" });
});

module.exports = router;
