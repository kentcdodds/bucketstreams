
var RouteHelper = require('./RouteHelper');

module.exports = function(app) {

  var restPrefix = '/api/v1/rest';

  RouteHelper.addConversionRoute(app, restPrefix + '/users', 'me', function(req) {
    // /api/v1/rest/users/me
    return req.user ? req.user.id : 'undefined';
  });

  RouteHelper.addConversionRoute(app, restPrefix + '/buckets', 'main', function(req) {
    // /api/v1/rest/buckets/main
    return req.user ? req.user.mainBucket : 'undefined';
  });

  RouteHelper.addConversionRoute(app, restPrefix + '/streams', 'main', function(req) {
    // /api/v1/rest/streams/main
    return req.user ? req.user.mainStream : 'undefined';
  });

  app.get(restPrefix + '/buckets', function(req, res, next) {
    if (req.query.bucketName) {
      req.query.name = req.query.bucketName;
      delete req.query.bucketName;
    }
    RouteHelper.convertUsernameQueryToId(req, 'owner', next);
  });

  app.get(restPrefix + '/streams', function(req, res, next) {
    if (req.query.streamName) {
      req.query.name = req.query.streamName;
      delete req.query.streamName;
    }
    RouteHelper.convertUsernameQueryToId(req, 'owner', next);
  });

};