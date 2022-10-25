/*
** webpack.config.js
*/

const path = require("path");
const webpack = require("webpack");

var webpackConfig = {
    mode: process.env.NODE_ENV,
    entry: {
        home: "./src/home/home.js",
        bbash18_teaser: "./src/bbash18_teaser.js",
        todo: "./src/todo/todo.js",
        sleeper: "./src/sleeper/sleeper.js",
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist",
        publicPath: "/",
    },
    optimization: {
        minimize: true,
    },
    resolve: {
        alias: {
            svelte: path.resolve("node_modules", "svelte")
        },
        extensions: [".svelte"],
    },
    module: {
        rules: [
            {
                test: /\.(html|svelte)$/,
                use: "svelte-loader"
            }, {
                // required to prevent errors from Svelte on Webpack 5+
                test: /node_modules\/svelte\/.*\.mjs$/,
                resolve: {
                    fullySpecified: false
                }
            }, {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
};

module.exports = webpackConfig;

