/*
** sleeper/router.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";

import { info } from "../utils/log.ts";
import * as path from "../utils/path.ts";

const router = express.Router();

router.get("/sleeper", (_req, res) => {
    info("GET /sleeper");
    res.sendFile("sleeper.html", {
        root: path.getViewsDirectory("sleeper")
    });
});

export default router;
