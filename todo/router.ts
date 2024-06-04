/*
** todo/router.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";

import { info } from "../utils/log.ts";
import * as path from "../utils/path.ts";

const router = express.Router();

router.get("/todo", (_req, res) => {
    info("GET /todo");
    res.sendFile("todo.html", {
        root: path.viewsDirectory("todo")
    });
});

export default router;
