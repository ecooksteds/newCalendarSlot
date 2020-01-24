var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport')
var pageRouter = require('./routes/pages');
var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));



// Serve static files. CSS, Images, JS files ... etc
app.use(express.static(path.join(__dirname, 'public')));


// Template engine. PUG
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// session
app.use(session({
    secret: 'youtube_video',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 2628000000
    }
}));
app.use(passport.initialize());
app.use(passport.session())

// Routers
app.use('/', pageRouter);


// Errors => page not found 404
app.use((req, res, next) => {
    var err = new Error('Page not found');
    err.status = 404;
    next(err);
})

// Handling errors (send them to the client)
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message);
});

// Setting up the server & port
var port = process.env.PORT || 8080

app.listen(port, function () {
    console.log('Server is running on port 8080...');
});
//adding comment
module.exports = app;