var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

/**
* Including the custom routes for api
**/
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var squareFrame = require('./routes/squareFrames');
var email = require('./routes/email');

var app = express();

/**
* Settings of request body
**/
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

/**
* Settings of whitelist IPs
**/
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
   res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
   //Auth Each API Request created by user.     
   next();
});

/**
* view engine setup
**/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('etag');

swaggerDocument = require('./swagger.json');

app.use('/', indexRouter);
app.use('/squareFrame', squareFrame);
app.use('/users', usersRouter);
app.use('/email', email);

/**
* catch 404 and forward to error handler
**/
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
