/*
 * routes/groupme.js
 * routes for GroupMe bot routes
 */

const express = require("express");

const emphasize = require("../groupme/emphasize");
const smts = require("../groupme/smts");

let router = express.Router();

router.post("/emphasize", (req, res) => emphasize(req, res));
router.post("/smts", (req, res) => smts(req, res));

module.exports = router;
