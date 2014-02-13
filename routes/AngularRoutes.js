var dataModels = require('../model').models;
var _ = require('lodash-node');
var logger = require('winston');
var ErrorController = require('../controller/ErrorController');

module.exports = function(app) {

  app.get('/api/v1/users/me', function(req, res, next) {
    if (req.isAuthenticated()) {
      req.url = '/api/v1/users/' + req.user.id;
      next();
    } else {
      return ErrorController.sendErrorJson(res, 401);
    }
  });

  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/v1/',
    requestPrehandler: function(req, res, next) {
      logger.info(req);
      next();
    }
  });

  angularBridge.addResource('users', dataModels.user, {
    hide: [ 'hash', 'salt' ],
    readOnly: [ '_id', 'modified', 'lastLoginDate'],
    query: '{  }'
  });

  angularBridge.addResource('posts', dataModels.post, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
    query: '{  }'
  });

  angularBridge.addResource('buckets', dataModels.bucket, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
    query: '{  }'
  });

  angularBridge.addResource('streams', dataModels.stream, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
    query: '{  }'
  });

  angularBridge.addResource('comments', dataModels.comment, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
    query: '{  }'
  });

};