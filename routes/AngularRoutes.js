var dataModels = require('../model').models;
var _ = require('lodash-node');
var logger = require('winston');

module.exports = function(app) {

  app.get('/', function(req, res, next) {
    return res.render('index', {});
  });

  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/v1/',
    requestPrehandler: function(req, res, next) {
      logger.info(req);
      next();
    }
  });

  angularBridge.addResource('users', dataModels.user, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
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
}