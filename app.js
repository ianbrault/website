/*
** app.js
*/

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const express = require("express");

const log = require("./log");
const router = require("./routes.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.static(path.resolve(__dirname, "dist")));
// TODO: REMOVE LATER, ONLY FOR TEMPORARY CSS
app.use(express.static(path.resolve(__dirname, "src/css")));

app.use("/", router);

let http_port = process.env.NODE_ENV === "production" ? 80 : 3080;
let https_port = process.env.NODE_ENV === "production" ? 443 : 3443;
log.log(`HTTP server running on port ${http_port}`);
log.log(`HTTPS server running on port ${https_port}`);

let certificate = fs.readFileSync("ianbrault.pem");
let private_key = fs.readFileSync("ianbrault.key");

http.createServer(app).listen(http_port);

https.createServer({
    key: private_key,
    cert: certificate
}, app).listen(https_port);
