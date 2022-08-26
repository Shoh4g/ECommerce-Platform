var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');

var cookieParser = require('cookie-parser');

var monk = require('monk');
var db = monk('127.0.0.1:27017/assignment2');

var productsRouter = require('./routes/products.js');

var app = express();

app.use(cookieParser())

const corsConfig = {
    origin: 'http://localhost:3000',
    credentials: true
};

app.use(cors(corsConfig))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to routers 
app.use(function(req,res,next){
    req.db = db; 
    next();
});
    
app.use('/', productsRouter);

// for requests not matching the above routes, create 404 error and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development environment
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// We explicitly let the app listen on port 3001
var server = app.listen(3001, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("iShop server listening at http://%s:%s", host, port);
})
