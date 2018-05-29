/*
 * app.js
 * main Express app file
 */

var httpError = require('http-errors')
var express = require('express')
var path = require('path')


var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    console.log("GET /");
    res.render('index');
})


// catch 404 errors
app.use((req, res, next) => next(httpError(404)))
app.use((err, req, res, next) => {
    console.log("ERROR [" + (err.status || 500) + "]", err.message)

    // only provide error in development
    res.locals.status = err.status;
    res.locals.message = err.message;
    res.locals.error = (req.app.get('env') === 'development') ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
})


app.listen(3000, () => console.log("server running on localhost:3000"))
