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

  var commonReadOnly = [ '_id', 'modified', 'created' ];

  angularBridge.addResource('users', dataModels.user, {
    hide: [ 'hash', 'salt', 'hidden', 'extraInfo' ],
    readOnly: _.union(commonReadOnly, ['lastLoginDate']),
    query: 'req.query'
  });

  angularBridge.addResource('posts', dataModels.post, {
    readOnly: commonReadOnly,
    query: 'req.query'
  });

  angularBridge.addResource('shares', dataModels.share, {
    readOnly: commonReadOnly,
    query: 'req.query'
  });

  angularBridge.addResource('buckets', dataModels.bucket, {
    readOnly: commonReadOnly,
    query: 'req.query'
  });
  
  angularBridge.addResource('streams', dataModels.stream, {
    readOnly: commonReadOnly,
    query: 'req.query'
  });

  angularBridge.addResource('comments', dataModels.comment, {
    readOnly: commonReadOnly,
    query: 'req.query'
  });

};