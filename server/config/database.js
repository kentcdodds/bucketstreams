var mongoose = require('mongoose');
var logger = require('winston');

module.exports = function() {

  // Setup model
  require('../model/index');

  var db = mongoose.connection;

  db.on('connecting', function() {
    var regex = /mongodb:\/\/.*?:(.*?)@.*?:.*?\/.*?$/;
    logger.info('Connecting to mongo database: ' + process.env.MONGO_CONNECTION_STRING.replace(regex, function(full, pass) {
      return full.replace(pass, '<<password-hidden>>');
    }));
  });

  db.on('error', function(error) {
    logger.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
  });
  
  db.on('connected', function() {
    logger.info('MongoDB connected');
  });
  
  db.on('open', function() {
    logger.info('MongoDB connection opened');
  });
  
  db.on('reconnected', function () {
    logger.info('MongoDB reconnected');
  });
  
  db.on('disconnected', function() {
    logger.warn('MongoDB disconnected');
    if (!process.BUCKET_STREAMS_EXITING) {
      logger.info('MongoDB attempting reconnect');
      connect();
    }
  });

  function connect() {
    mongoose.connect(process.env.MONGO_CONNECTION_STRING);
  }
  connect();


};