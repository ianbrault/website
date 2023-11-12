/*
** main.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";

import * as path from "$std/path/mod.ts";

import router from "./router.ts";
import { info } from "./utils/log.ts";
import { getProjectDirectory, getStaticDirectory } from "./utils/path.ts";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(router);

// add static paths
app.use(express.static(path.join(getProjectDirectory(), "dist")));
app.use(express.static(path.join(getProjectDirectory(), "static")));
// add static paths from apps here
app.use(express.static(getStaticDirectory("archive")));
app.use(express.static(getStaticDirectory("home")));
app.use(express.static(getStaticDirectory("todo")));

const port = 3030;
app.listen(port, () => info(`server running on https://127.0.0.1:${port}`));
