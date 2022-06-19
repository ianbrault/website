/*
** app.js
*/

const fs = require("fs");
const https = require("https");
const path = require("path");

const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");

const log = require("./log");
const router = require("./routes");
const config = require("./webpack.config");

// set up the express app
const app = express();
const compiler = webpack(config);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.static(path.resolve(__dirname, "dist")));
// TODO: REMOVE LATER, ONLY FOR TEMPORARY CSS
app.use(express.static(path.resolve(__dirname, "src/css")));

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
}));

app.use("/", router);

// set up the HTTP/HTTPS servers
let https_port = process.env.NODE_ENV === "production" ? 443 : 3443;
log.log(`HTTPS server running on port ${https_port}`);

let certificate = fs.readFileSync("ianbrault.pem");
let private_key = fs.readFileSync("ianbrault.key");

// HTTPS server
https.createServer({
    key: private_key,
    cert: certificate
}, app).listen(https_port);

