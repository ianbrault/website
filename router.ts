/*
** router.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";

import archive from "./archive/router.ts";
import home from "./home/router.ts";
import sleeper from "./sleeper/router.ts";
import todo from "./todo/router.ts";

const router = express.Router();
// add routers from apps here
router.use(archive);
router.use(home);
router.use(sleeper);
router.use(todo);

export default router;
