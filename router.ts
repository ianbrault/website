/*
** router.ts
*/

import express from "express";

import archive from "./archive/router.ts";
import basil from "./basil/router.ts";
import home from "./home/router.ts";
import random from "./random/router.ts";
import sleeper from "./sleeper/router.ts";

import { info } from "./utils/log.ts";
import * as path from "./utils/path.ts";

const router = express.Router();
// add routers from apps here
router.use(archive);
router.use(basil);
router.use(home);
router.use(random);
router.use(sleeper);

// Apple associated domain file for apps
router.get("/.well-known/apple-app-site-association", (_req, res) => {
    info("GET /.well-known/apple-app-site-association");
    res.sendFile("apple-app-site-association", {
        root: path.projectDirectory()
    });
});

export default router;
