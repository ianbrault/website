/*
 * routes/index.js
 */

const babelify = require("babelify");
const browserify = require("browserify-middleware");
const express = require("express");

const archive = require("./archive");
const Log = require("../log");

let router = express.Router();

router.use("/archive", archive);

router.use("/js", browserify("./src", {
    transform: [babelify.configure({
        presets: ["@babel/preset-env"]
    })]
}));

router.get("/", (req, res) => {
    Log.log("GET /");
    res.render("index");
});

router.post("/groupme/smts", (req, res) => smts(req, res));

module.exports = router;
