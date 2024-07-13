/*
** main.ts
*/

import express from "express";
import mongoose from "mongoose";

import path from "path";

import build from "./build.ts";
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
app.use(express.static(staticDirectory("sleeper")));

// build website assets
await build();
// connect to the MongoDB database
const dbURL = "mongodb://localhost:27017";
await mongoose.connect(dbURL);
info(`connected to database at ${dbURL}`);
// start the HTTPS server
const port = 3030;
app.listen(port, () => info(`server running on https://127.0.0.1:${port}`));
