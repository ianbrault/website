/*
** main.ts
*/

import express from "express";
import mongoose from "mongoose";

import path from "path";

import { parseArgs } from "./args.ts";
import build from "./build.ts";
import router from "./router.ts";
import { info, setPrefix } from "./utils/log.ts";
import { projectDirectory, staticDirectory } from "./utils/path.ts";

import BasilWSServer from "./basil/server/server.ts";
import UserMigration from "./basil/migrations/User.ts";

// parse command-line arguments
const args = parseArgs(process.argv);
const port = args.nightly ? 8080 : 3030;
setPrefix(args.nightly ? "nightly" : "server");

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
app.use(express.static(staticDirectory("random/aoc_lanternfish")));
app.use(express.static(staticDirectory("random/grid")));
app.use(express.static(staticDirectory("sleeper")));

// build website assets
await build();

// connect to the MongoDB database
const dbURL = "mongodb://localhost:27017";
await mongoose.connect(dbURL);
info(`connected to database at ${dbURL}`);
// run any model migrations
await UserMigration.migrate();

// start the HTTPS server
app.listen(
    port,
    () => info(`server running on https://localhost:${port}`)
);

// start the Basil WebSocket server
new BasilWSServer();

// gracefully handle Ctrl+C
process.once("SIGTERM", (_) => {
    info("Ctrl+C received, terminating");
    process.exit(0);
});
