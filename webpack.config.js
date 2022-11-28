/*
** webpack.config.js
*/

const path = require("path");
const webpack = require("webpack");

var webpackConfig = {
    mode: process.env.NODE_ENV,
    entry: {
        // TODO: uncomment if dynamic content is needed for the homepage
        // home: "./src/home/home.js",
        todo: "./src/todo/todo.js",
        sleeper: "./src/sleeper/sleeper.js",
        // archived sites
        bbash18_teaser: "./src/bbash18_teaser.js",
        faroutfest: "./src/faroutfest/faroutfest.js",
        faroutfest_lineup: "./src/faroutfest/lineup.js",
        faroutfest_slideshow: "./src/faroutfest/slideshow.js",
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
