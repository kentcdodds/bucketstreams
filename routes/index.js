var _ = require('lodash-node');
var dataModels = require('../model').models;
var ErrorController = require('../controller/ErrorController');
var User = dataModels.user;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(app) {
  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/v1/',
    requestPrehandler: function(req, res, next) {
      console.log(req);
      next();
    }
  });

  for (var model in dataModels) {
    angularBridge.addResource(model + 's', dataModels[model]);
  }

  app.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
      if (err) {
        return ErrorController.sendErrorJson(res, 400, 'Problem registering user. Error:\n' + JSON.stringify(err, null, 2));
      }
      return res.json(200, user);
    });
  });

  app.post('/login', passport.authenticate('local'), function(req, res) {
    return res.json(200, req.user);
  });

//  app.post('/login', function(req, res, next) {
//    passport.authenticate('local', function(err, user, info) {
//      if (err) return next(err);
//
//      if (!user) {
//        return ErrorController.sendErrorJson(401, 'No such user exists');
//      }
//
//      req.logIn(user, function(err) {
//        if (err) return next(err);
//
//        return res.json(200, req.user);
//      });
//    })(req, res, next);
//  });

  app.get('/logout', function(req, res) {
    req.logout();
    return res.json(200, {success: 'Logout successful'});
  });

  app.get('/', function(req, res, next) {
    console.log('rendering index');
    return res.render('index', {});
  });
};
