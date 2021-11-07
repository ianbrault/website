const path = require("path");

module.exports = {
    entry: {
        // home: "./src/home.js",
        bbash18_teaser: "./src/bbash18_teaser.js",
        sports_console: "./src/sports_console/sports_console.js"
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist"
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
