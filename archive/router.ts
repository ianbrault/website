/*
** archive/router.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";

import { info } from "../utils/log.ts";
import * as path from "../utils/path.ts";

const router = express.Router();

router.get("/archive/bbash18-teaser", (_req, res) => {
    info("GET /archive/bbash18-teaser");
    res.sendFile("bbash18_teaser.html", {
        root: path.getViewsDirectory("archive")
    });
});

router.get("/archive/faroutfest", (_req, res) => {
    info("GET /archive/faroutfest");
    res.sendFile("faroutfest.html", {
        root: path.getViewsDirectory("archive")
    });
});

router.get("/archive/faroutfest/faq", (_req, res) => {
    info("GET /archive/faroutfest/faq");
    res.sendFile("faroutfest_faq.html", {
        root: path.getViewsDirectory("archive")
    });
});

export default router;
