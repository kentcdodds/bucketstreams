
var RouteHelper = require('./RouteHelper');
var ErrorController = require('../controller/ErrorController');

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

  app.get(restPrefix + '/:resource', function(req, res, next) {
    if (/buckets|streams/.test(req.params.resource)) {
      RouteHelper.convertUsernameQueryToId(req, 'owner', function(err) {
        if (err) return ErrorController(res, err.code, err.error.message);
        next();
      });
    } else {
      next();
    }
  });
};