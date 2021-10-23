const path = require("path");

module.exports = {
    entry: {
        // home: "./src/home.js",
        bbash18_teaser: "./src/bbash18_teaser.js"
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist"
    },
    optimization: {
        minimize: true,
    },
};
