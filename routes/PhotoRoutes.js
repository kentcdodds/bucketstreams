var S3Controller = require('../controller/S3Controller');
var AuthenticationController = require('../controller/AuthenticationController');

module.exports = function(app) {
  app.post('/upload/image', AuthenticationController.checkAuthenticated, S3Controller.uploadPhoto);
};