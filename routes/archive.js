/*
 * routes/archive.js
 * routes for archived sites
 */

const express = require("express");

let router = express.Router();

router.get("/bbash18-teaser", (req, res) => {
    res.render("bbash18_teaser");
});

module.exports = router;
