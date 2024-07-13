/*
** router.ts
*/

import express from "express";

import archive from "./archive/router.ts";
import home from "./home/router.ts";
import recipeBook from "./recipe_book/router.ts";
import sleeper from "./sleeper/router.ts";

const router = express.Router();
// add routers from apps here
router.use(archive);
router.use(home);
router.use(recipeBook);
router.use(sleeper);

export default router;
