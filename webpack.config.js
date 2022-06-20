/*
** webpack.config.js
*/

const path = require("path");
const webpack = require("webpack");

module.exports = {
    // TODO: figure out a better way to do this
    mode: "development",
    entry: {
        home: "./src/home/home.js",
        todo: "./src/todo/todo.js",
        bbash18_teaser: "./src/bbash18_teaser.js",
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
