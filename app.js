/*
** app.js
*/

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");

const log = require("./log");
const router = require("./routes.js");

// set up the express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.static(path.resolve(__dirname, "dist")));
// TODO: REMOVE LATER, ONLY FOR TEMPORARY CSS
app.use(express.static(path.resolve(__dirname, "src/css")));

app.use("/", router);

// connect to the MongoDB database
const uri = "mongodb://127.0.0.1:27017/sports";
mongoose.connect(uri)
    .then(() => log.log(`successfully connected to database at ${uri}`))
    .catch((err) => log.log_error(`failed to connect to database at ${uri}: ${err}`));

// set up the HTTP/HTTPS servers
let http_port = process.env.NODE_ENV === "production" ? 80 : 3080;
let https_port = process.env.NODE_ENV === "production" ? 443 : 3443;
log.log(`HTTP server running on port ${http_port}`);
log.log(`HTTPS server running on port ${https_port}`);

let certificate = fs.readFileSync("ianbrault.pem");
let private_key = fs.readFileSync("ianbrault.key");

// HTTP server
http.createServer(app).listen(http_port);
// HTTPS server
https.createServer({
    key: private_key,
    cert: certificate
}, app).listen(https_port);
