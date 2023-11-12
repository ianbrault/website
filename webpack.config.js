/*
** webpack.config.js
*/

const path = require("path");

module.exports = {
    entry: {
        bbash18_teaser: "./archive/src/bbash18_teaser.js",
        faroutfest: "./archive/src/faroutfest/faroutfest.js",
        faroutfest_lineup: "./archive/src/faroutfest/lineup.js",
        faroutfest_slideshow: "./archive/src/faroutfest/slideshow.js",
        sleeper: "./sleeper/src/sleeper.js",
        todo: "./todo/src/todo.js",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/",
    },
    optimization: {
        minimize: true,
    },
    resolve: {
        alias: {
            svelte: path.resolve("node_modules", "svelte/src/runtime")
        },
        extensions: [".mjs", ".js", ".svelte"],
        mainFields: ["svelte", "browser", "module", "main"],
        conditionNames: ["svelte", "browser", "import"]
    },
    module: {
        rules: [
            {
                test: /\.(html|svelte)$/,
                use: "svelte-loader"
            },
            {
                test: /node_modules\/svelte\/.*\.mjs$/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
};
