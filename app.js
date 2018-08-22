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

// routing
app.get("/", (req, res) => {
    console.log("GET /");
    res.render("index");
});

// error handler
app.use((err, req, res, next) => {
    let emsg = `Error [${err.status || 500}]: ${err.message}`;
    console.error(emsg);
    res.status(err.status || 500).send(emsg);
});

app.listen(3000, () => 
    console.log("\n===== Ian's Website\nserver running on localhost:3000"));
