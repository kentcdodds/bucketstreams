var localConfig = require('./local/config');
var mongoose = require('mongoose');

if (localConfig) {
  localConfig();
}

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  process.env.MONGO_CONNECTION_STRING = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

require('./model');
require('./config/passport');

// Connect to database
mongoose.connect(process.env.MONGO_CONNECTION_STRING, function(err) {
  if (err) {
    console.log('Error connecting to database!', err);
  } else {
    console.log('Connected to Mongo Database: ', process.env.MONGO_CONNECTION_STRING);
  }
});


var app = require('express')();
app.directory = __dirname;

require('./config/setup-express')(app);
require('./routes')(app);

module.exports = app;
