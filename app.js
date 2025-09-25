var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/comments',require('./routes/comments'))
app.use('/products',require('./routes/products'))
app.use('/categories',require('./routes/categories'))

// MongoDB connection - you can switch between local and cloud
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NNPTUD-S5';
// For Atlas, replace with: 'mongodb+srv://username:password@cluster.mongodb.net/NNPTUD-S5'

mongoose.connect(MONGODB_URI).catch(
  function(err){
    console.log('MongoDB connection error:', err.message);
    console.log('Please check your MongoDB connection string');
  }
)
mongoose.connection.on('connected',function(){
  console.log('✅ MongoDB connected successfully');
})
mongoose.connection.on('error', function(err) {
  console.log('❌ MongoDB connection error:', err);
})
mongoose.connection.on('disconnected', function() {
  console.log('⚠️ MongoDB disconnected');
})

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
  
  // If it's an API request, send JSON response
  if (req.path.startsWith('/api') || req.path.startsWith('/products') || req.path.startsWith('/categories') || req.path.startsWith('/users') || req.path.startsWith('/comments')) {
    res.json({
      success: false,
      error: err.message,
      status: err.status || 500
    });
  } else {
    res.render('error');
  }
});

module.exports = app;
