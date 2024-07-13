/*
** home/router.ts
*/

import express from "express";

import { info } from "../utils/log.ts";
import * as path from "../utils/path.ts";

const router = express.Router();

router.get("/", (_req, res) => {
    info("GET /");
    res.sendFile("home.html", {
        root: path.viewsDirectory("home")
    });
});

router.get("/projects", (_req, res) => {
    info("GET /projects");
    res.sendFile("projects.html", {
        root: path.viewsDirectory("home")
    });
});

export default router;
