var dataModels = require('../model/index').models;
var prefixes = require('./prefixes');
var _ = require('lodash-node');
var ErrorController = require('../controller/ErrorController');

module.exports = function(app) {

  app.get(prefixes.rest + '/users', function(req, res, next) {
    if (req.query.genie) {
      var regexString = req.query.genie.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      var regex = new RegExp(regexString, 'i');
      var query = [
        { username: regex },
        { 'name.first': regex },
        { 'name.last': regex }
      ];
      dataModels.user.find({$or: query}, function(err, users) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        res.json(users);
      });
    } else {
      next();
    }
  });

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

  angularBridge.addResource('shares', dataModels.share, {
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