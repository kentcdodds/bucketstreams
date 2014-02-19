var dataModels = require('../model').models;
var _ = require('lodash-node');
var logger = require('winston');

module.exports = function(app) {

  function addConversionRoute(resourceName, simpleName, getReplacement) {
    var regexRoute = new RegExp('^(\\/api\\/v1\\/' + resourceName + '\\/)(' + simpleName + ')(.*?)');
    app.all(regexRoute,
      function(req, res, next) {

      req.url = req.url.replace(regexRoute, '$1' + getReplacement(req) + '$3');
      next();
    });
  }

  addConversionRoute('users', 'me', function(req) {
    return req.user ? req.user.id : 'undefined';
  });

  addConversionRoute('buckets', 'main', function(req) {
    return req.user ? req.user.mainBucket : 'undefined';
  });

  addConversionRoute('streams', 'main', function(req) {
    return req.user ? req.user.mainStream : 'undefined';
  });

  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/v1/',
    requestPrehandler: function(req, res, next) {
//      logger.info(req);
      next();
    }
  });

  angularBridge.addResource('users', dataModels.user, {
    hide: [ 'hash', 'salt' ],
    readOnly: [ '_id', 'modified', 'lastLoginDate'],
    query: 'req.query'
  });

  angularBridge.addResource('posts', dataModels.post, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
    query: 'req.query'
  });

  angularBridge.addResource('buckets', dataModels.bucket, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
    query: 'req.query'
  });

  angularBridge.addResource('streams', dataModels.stream, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
    query: 'req.query'
  });

  angularBridge.addResource('comments', dataModels.comment, {
    hide: [
      ''
    ],
    readOnly: [
      '_id'
    ],
    query: 'req.query'
  });

};