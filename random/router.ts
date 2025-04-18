/*
** random/router.ts
*/

import express from "express";

import { info } from "../utils/log.ts";
import * as path from "../utils/path.ts";

const router = express.Router();

router.get("/random/aoc_lanternfish", (_req, res) => {
    info("GET /random/aoc_lanternfish");
    res.sendFile("index.html", {
        root: path.viewsDirectory("random/aoc_lanternfish")
    });
});

router.get("/random/grid", (_req, res) => {
    info("GET /random/grid");
    res.sendFile("index.html", {
        root: path.viewsDirectory("random/grid")
    });
});

export default router;
