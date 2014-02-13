var mongoose = require('mongoose');
var logger = require('winston');

module.exports = function() {

  // Setup model
  require('../model');

  // Connect to database
  var regex = /mongodb:\/\/.*?:(.*?)@.*?:.*?\/.*?$/;
  logger.info('Connecting to mongo database: ' + process.env.MONGO_CONNECTION_STRING.replace(regex, function(full, pass) {
    return full.replace(pass, '<<password-hidden>>');
  }));
  mongoose.connect(process.env.MONGO_CONNECTION_STRING, function(err) {
    if (err) {
      logger.error('Error connecting to database!', err);
    } else {
      logger.info('Connected to database');
    }
  });


};