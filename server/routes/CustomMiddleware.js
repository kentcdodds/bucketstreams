var User = require('../model/User').model;
var RouteHelper = require('./RouteHelper');
var ErrorController = require('../controller/ErrorController');

module.exports = function(app) {

  var restPrefix = '/api/v1/rest';

  RouteHelper.addConversionRoute(app, restPrefix + '/users', 'me', function(req) {
    // /api/v1/rest/users/me
    return req.user ? req.user.id : null;
  });

  RouteHelper.addConversionRoute(app, restPrefix + '/buckets', 'main', function(req) {
    // /api/v1/rest/buckets/main
    return req.user ? req.user.mainBucket : null;
  });

  RouteHelper.addConversionRoute(app, restPrefix + '/streams', 'main', function(req) {
    // /api/v1/rest/streams/main
    return req.user ? req.user.mainStream : null;
  });

  app.get(restPrefix + '/:resource', function(req, res, next) {
    if (/buckets|streams/.test(req.params.resource)) {
      if (req.query.owner === 'me') {
        if (req.isAuthenticated()) {
          req.query.owner = req.user.id;
        } else {
          return ErrorController.sendErrorJson(res, 401, 'Must be authenticated to pass "me" as owner');
        }
      }
      RouteHelper.convertUsernameQueryToId(req, 'owner', function(err) {
        if (err) return ErrorController.sendErrorJson(res, err.code, err.error.message);
        next();
      });
    } else {
      next();
    }
  });
  
  app.get(restPrefix + '/users/discover', function(req, res, next) {
    if (!req.query.username) return ErrorController.sendErrorJson(res, 400, 'Must pass username');
    var exclude = {};
    if (req.query.username === 'me') {
      if (req.isAuthenticated()) {
        exclude['_id'] = {$ne: req.user.id};
      } else {
        return ErrorController.sendErrorJson(res, 401, 'Must be authenticated to pass "me" as owner');
      }
    } else {
      exclude['username'] = {$ne: req.query.username};
    }
    User.find(exclude).limit(20).sort('-modified').select('_id name username tagline profilePicture').exec(function(err, users) {
      if (err) return ErrorController.sendErrorJson(res, err.code, err.error.message);
      res.json(users);
    });
  });
};