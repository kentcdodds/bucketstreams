var dataModels = require('../model').models;
var prefixes = require('./prefixes');
var _ = require('lodash-node');

module.exports = function(app) {

  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : prefixes.rest + '/'
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