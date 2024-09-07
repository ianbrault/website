/*
** router.ts
*/

import express from "express";
import path from "path";

import archive from "./archive/router.ts";
import home from "./home/router.ts";
import recipeBook from "./recipe_book/router.ts";
import sleeper from "./sleeper/router.ts";

import { info } from "./utils/log.ts";
import * as pathUtils from "./utils/path.ts";

const router = express.Router();
// add routers from apps here
router.use(archive);
router.use(home);
router.use(recipeBook);
router.use(sleeper);

// Apple associated domain file for apps
router.get(".well-known/apple-app-site-association", (_req, res) => {
    info("GET /.well-known/apple-app-site-association");
    res.sendFile("apple-app-site-association", {
        root: path.join(pathUtils.projectDirectory(), "apple-app-site-association")
    });
});

export default router;
