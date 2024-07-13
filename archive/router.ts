/*
** archive/router.ts
*/

import express from "express";

import { info } from "../utils/log.ts";
import * as path from "../utils/path.ts";

const router = express.Router();

router.get("/archive/bbash18-teaser", (_req, res) => {
    info("GET /archive/bbash18-teaser");
    res.sendFile("bbash18_teaser.html", {
        root: path.viewsDirectory("archive")
    });
});

router.get("/archive/faroutfest", (_req, res) => {
    info("GET /archive/faroutfest");
    res.sendFile("faroutfest.html", {
        root: path.viewsDirectory("archive")
    });
});

router.get("/archive/faroutfest/faq", (_req, res) => {
    info("GET /archive/faroutfest/faq");
    res.sendFile("faroutfest_faq.html", {
        root: path.viewsDirectory("archive")
    });
});

export default router;
