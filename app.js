/*
 * app.js
 * main Express app file
 */

var express = require("express");
var app = express();


// view engine setup
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
    return `[${hour}:${mins}:${secs} ${date}]: `;
};

const log = (msg) => {
    console.log(`${logfmt() + msg}`);
};

const log_error = (emsg) => {
    console.log(`${logfmt() + emsg}`);
};


// routing

app.get("/", (req, res) => {
    log("GET /");
    res.render("index");
});


// error handler

app.use((err, req, res, next) => {
    let emsg = `Error [${err.status || 500}]: ${err.message}`;
    log_error(emsg);
    res.status(err.status || 500).send(emsg);
});


app.listen(3000, () => {
    console.log("\n===== Ian's Website");
    log("server running on http://localhost:3000/");
});
