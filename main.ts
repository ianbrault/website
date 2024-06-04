/*
** main.ts
*/

// @deno-types="npm:@types/express@4"
import express from "npm:express@4.18";
import mongoose from "npm:mongoose@^6.7";

import * as path from "$std/path/mod.ts";

import router from "./router.ts";
import { info } from "./utils/log.ts";
import { projectDirectory, staticDirectory } from "./utils/path.ts";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(router);

// add static paths
app.use(express.static(path.join(projectDirectory(), "dist")));
app.use(express.static(path.join(projectDirectory(), "static")));
// add static paths from apps here
app.use(express.static(staticDirectory("archive")));
app.use(express.static(staticDirectory("home")));
app.use(express.static(staticDirectory("todo")));

// connect to the database
const dbURL = "mongodb://localhost:27017";
await mongoose.connect(dbURL);
info(`connected to database at ${dbURL}`);

const port = 3030;
app.listen(port, () => info(`server running on https://127.0.0.1:${port}`));
