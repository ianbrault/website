/*
 * app.js
 */

const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");

const Log = require("./log");

const router = require("./routes/index.js");

const app = express();

app.set("views", "views");
app.set("view engine", "jade");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/", router);

let http_port = process.env.NODE_ENV === "production" ? 80 : 3080;
let https_port = process.env.NODE_ENV === "production" ? 443 : 3443;
Log.log(`HTTP server running on port ${http_port}`);
Log.log(`HTTPS server running on port ${https_port}`);

let certificate = fs.readFileSync("ianbrault.pem");
let private_key = fs.readFileSync("ianbrault.key");

http.createServer(app).listen(http_port);

https.createServer({
    key: private_key,
    cert: certificate
}, app).listen(https_port);
