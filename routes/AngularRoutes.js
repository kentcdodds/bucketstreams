var dataModels = require('../model').models;
var _ = require('lodash-node');
var logger = require('winston');
var ErrorController = require('../controller/ErrorController');

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
    // /api/v1/users/me
    return req.user ? req.user.id : 'undefined';
  });

  addConversionRoute('buckets', 'main', function(req) {
    // /api/v1/buckets/main
    return req.user ? req.user.mainBucket : 'undefined';
  });

  addConversionRoute('streams', 'main', function(req) {
    // /api/v1/streams/main
    return req.user ? req.user.mainStream : 'undefined';
  });

  /*
   * Helper routes
   */
  function convertUsernameQueryToId(req, newName, callback) {
    if (req.query.username) {
      dataModels.user.getByUsername(req.query.username, function(err, user) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        if (!user || !user[0]) return ErrorController.sendErrorJson(res, 400, 'No user with username ' + req.query.username);
        delete req.query.username;
        req.query[newName] = user[0].id;
        callback();
      });
    } else {
      callback();
    }
  }

  app.get('/api/v1/buckets', function(req, res, next) {
    if (req.query.bucketName) {
      req.query.name = req.query.bucketName;
      delete req.query.bucketName;
    }
    convertUsernameQueryToId(req, 'owner', next);
  });

  app.get('/api/v1/streams', function(req, res, next) {
    console.log('I am here!');
    if (req.query.streamName && req.query.username && req.query.posts) {
      delete req.query.posts;
      req.query.name = req.query.streamName;
      delete req.query.streamName;
      convertUsernameQueryToId(req, 'owner', function() {
        dataModels.stream.findOne(req.query, function(err, stream) {
          if (err) return ErrorController.sendErrorJson(res, 500, err.message);
          if (!stream) return ErrorController.sendErrorJson(res, 400, 'No stream with the name ' + req.query.name);
          stream.getPosts(function(err, posts) {
            if (err) return ErrorController.sendErrorJson(res, 500, err.message);
            res.json({
              stream: stream,
              posts: posts
            });
          });
        });
      });
    } else {
      next();
    }
  });

  app.get('/api/v1/streams', function(req, res, next) {
    if (req.query.streamName) {
      req.query.name = req.query.streamName;
      delete req.query.streamName;
    }
    convertUsernameQueryToId(req, 'owner', next);
  });

  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/v1/',
    requestPrehandler: function(req, res, next) {
      logger.info('resource request url', req.url);
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