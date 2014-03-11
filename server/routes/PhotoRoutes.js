var S3Controller = require('../controller/S3Controller');
var AuthenticationController = require('../controller/AuthenticationController');
var prefix = require('./prefixes');

module.exports = function(app) {
  app.post(prefix.upload + '/image', AuthenticationController.checkAuthenticated, S3Controller.uploadPhoto);
};