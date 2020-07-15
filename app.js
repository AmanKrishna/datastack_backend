var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = require('./config');
var passport = require('passport');

// connect to the database server
const mongoose = require('mongoose');
url = config.mongoUrl;
// const connect = mongoose.connect(url);
const connect = mongoose.connect(process.env.MONGODB_URI || url);
connect.then((db)=>{
  console.log("Connnected to server!");
},
(err)=>{
  console.log(err);
});


var app = express();

// redirect any requrest to secure server
app.all('*',(req,res,next)=>{
  // if the requrest is coming to the secure port
  if(req.secure){
    return next();
  }
  else{
    console.log(req.hostname+" "+app.get('secPort')+" "+req.url);
    res.redirect(307,'https://'+req.hostname+':'+app.get('secPort')+req.url);
  }
})
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,*");
  next();
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var audio = require('./routes/audio');
var hindiText = require('./routes/hindiText');
var adminRoute = require('./routes/admin');
var resetPassword = require('./routes/reset');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({limit: '10mb'}));
// app.use(express.urlencoded({limit: '50mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// use passport
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/audio',audio);
app.use('/hindiText',hindiText);
app.use('/admin6089',adminRoute);
app.use('/reset',resetPassword);

// catch 404 and forward to error handler
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
