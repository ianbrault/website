/*
** sleeper/router.ts
*/

import express from "express";

import { info } from "../utils/log.ts";
import * as path from "../utils/path.ts";

const router = express.Router();

router.get("/sleeper", (_req, res) => {
    info("GET /sleeper");
    res.sendFile("sleeper.html", {
        root: path.viewsDirectory("sleeper")
    });
});

export default router;
