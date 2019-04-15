/*
 * app.js
 */

const express = require("express");
const fs = require("fs");
const https = require("https");

const Log = require("./log");
const smts = require("./smts");

const router = require("./routes/index.js");

const app = express();

app.set("views", "views");
app.set("view engine", "jade");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// set up routing

app.use("/", router);

let port = process.env.NODE_ENV === "production" ? 443 : 3000;
Log.log(`HTTPS server running on port ${port}`);

// set up HTTPS server

let certificate = fs.readFileSync("ianbrault.pem");
let private_key = fs.readFileSync("ianbrault.key");

https.createServer({
    key: private_key,
    cert: certificate
}, app).listen(port);
