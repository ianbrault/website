/*
 * app.js
 * main Express app file
 */

var babelify = require("babelify");
var browserify = require("browserify-middleware");
var express = require("express");

var app = express();

app.set("views", "views");
app.set("view engine", "jade");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));


// logging

const logfmt = () => {
    let dateObj = new Date();
    let date = `${dateObj.getFullYear()}.${dateObj.getMonth()+1}.${dateObj.getDate()}`;
    let hour = dateObj.getHours().toString().padStart(2, "0");
    let mins = dateObj.getMinutes().toString().padStart(2, "0");
    let secs = dateObj.getSeconds().toString().padStart(2, "0");
    return `[${date} ${hour}:${mins}:${secs}]:`;
};

const log = (msg) => console.log(`${logfmt()} ${msg}`);
const log_error = (emsg) => console.log(`${logfmt()} ERROR: ${emsg}`);


// routing

app.use("/js", browserify(__dirname + "/src", {
    transform: [babelify.configure({
        presets: ["@babel/preset-env"]
    })]
}));

app.get("/", (req, res) => {
    log("GET /");
    res.render("index");
});

app.use((req, res) => {
    let emsg = `page "${req.originalUrl}" not found`;
    log_error(emsg);
    res.status(404);

    if (req.accepts("html"))
        return res.send(emsg); // TODO
    else if (req.accepts("json"))
        return res.send({ error: emsg });
    res.type("txt").send(emsg);
});

let port = process.env.NODE_ENV === "production" ? 80 : 3000;
app.listen(port, () => log(`server running on port ${port}`));
