var _ = require('lodash-node');
var dataModels = require('../model').models;
var ErrorController = require('../controller/ErrorController');
var User = dataModels.user;
var passport = require('passport');

module.exports = function(app) {
  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/v1/',
    requestPrehandler: function(req, res, next) {
      console.log(req);
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

  app.get('/', function(req, res, next) {
    console.log('rendering index');
    return res.render('index', {});
  });
};
