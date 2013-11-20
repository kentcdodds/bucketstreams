var app = require('express')();

var localConfig = require('./local/config');
var mongoose = require('mongoose');

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
require('./controller/AuthenticationController').setupPassport();

// Connect to database
mongoose.connect(process.env.MONGO_CONNECTION_STRING, function(err) {
  if (err) {
    console.log('Error connecting to database!', err);
  } else {
    console.log('Connected to Mongo Database: ', process.env.MONGO_CONNECTION_STRING);
  }
});

require('./config/setup-express')(app);
require('./routes')(app);
require('./routes/AuthenticationRoutes').setupRoutes(app);

module.exports = app;
