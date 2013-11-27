// modules
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var logger = require('winston');

// local vars
var localConfig = require('./local/config');
var app = require('express')();

app.directory = __dirname;

if (localConfig) {
  localConfig();
}

// Setup mongo connection string
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  process.env.MONGO_CONNECTION_STRING = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

require('./model');
require('./controller/AuthenticationController');

// Connect to database
mongoose.connect(process.env.MONGO_CONNECTION_STRING, function(err) {
  if (err) {
    logger.error('Error connecting to database!', err);
  } else {
    logger.info('Connected to Mongo Database: ', process.env.MONGO_CONNECTION_STRING);
  }
});

// Setup express
if (process.env.NODE_ENV === 'production') {
  process.env.BASE_URL = 'http://www.bucketstreams.com';
  app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 9000);
  app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
//    app.use(express.cookieParser('Rock Run Slime George'));
} else {
  app.set('port', process.env.PORT || 9000);
  app.set('ip', process.env.IP || '127.0.0.1');
  app.use(express.errorHandler());
}

app.set('views', app.directory + '/app');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.cookieParser('Toy Lion Story King'));
app.use(express.session({secret: 'medusa red podium'}));

app.use(express.static(app.directory + '/app'));

app.use(passport.initialize());
app.use(passport.session());


require('./routes')(app);
var HelperRoutes = require('./local/HelperRoutes');
if (HelperRoutes) {
  HelperRoutes(app);
}

module.exports = app;
