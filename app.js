/*
 * app.js
 * main Express app file
 */

const babelify = require("babelify");
const browserify = require("browserify-middleware");
const express = require("express");
const fs = require("fs");
const https = require("https");

const Log = require("./log");
const smts = require("./smts");

const app = express();

app.set("views", "views");
app.set("view engine", "jade");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// set up routing

app.use("/js", browserify(__dirname + "/src", {
    transform: [babelify.configure({
        presets: ["@babel/preset-env"]
    })]
}));

app.get("/", (req, res) => {
    Log.log("GET /");
    res.render("index");
});

app.post("/groupme/smts", (req, res) => smts(req, res));

app.use((req, res) => {
    let emsg = `page "${req.originalUrl}" not found`;
    Log.log_error(emsg);
    res.status(404);

    if (req.accepts("html"))
        return res.send(emsg); // TODO
    else if (req.accepts("json"))
        return res.send({ error: emsg });
    res.type("txt").send(emsg);
});

let port = process.env.NODE_ENV === "production" ? 443 : 3000;
Log.log(`server running on port ${port}`);

let certificate = fs.readFileSync("ianbrault.pem");
let private_key = fs.readFileSync("ianbrault.key");

https.createServer({
    key: private_key,
    cert: certificate
}, app).listen(port);
