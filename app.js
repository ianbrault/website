/*
** app.js
*/

const fs = require("fs");
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

const port = 3030;
app.listen(port, () => log.log(`server running on https://127.0.0.1:${port}`));

