var mongoose = require('mongoose');
var logger = require('winston');

module.exports = function() {

  // Setup model
  require('../model');

  // Setup mongo connection string
  if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    process.env.MONGO_CONNECTION_STRING = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
      process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
      process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
      process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
      process.env.OPENSHIFT_APP_NAME;
  }

  // Connect to database
  mongoose.connect(process.env.MONGO_CONNECTION_STRING, function(err) {
    if (err) {
      logger.error('Error connecting to database!', err);
    } else {
      logger.info('Connected to Mongo Database: ', process.env.MONGO_CONNECTION_STRING);
    }
  });


}