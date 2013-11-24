'use strict';

var AuthenticationController = require('../controller/AuthenticationController');
var ErrorController = require('../controller/ErrorController');
var User = require('../model/User').model;
var passport = require('passport');

module.exports = function(app) {
  app.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
      if (err) return ErrorController.sendErrorJson(res, 400, 'Problem registering user. Error:\n' + JSON.stringify(err, null, 2));

      req.login(user, function(err) {
        if (err) return ErrorController.sendErrorJson(res, 400, 'Problem automatically logging in user. Error: \n' + JSON.stringify(err, null, 2));

        return res.json(200, user);
      });
    });
  });

  app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) return next(err);

      if (!user) {
        return ErrorController.sendErrorJson(401, 'No such user exists');
      }

      req.logIn(user, function(err) {
        if (err) return next(err);

        return res.json(200, req.user);
      });
    })(req, res, next);
  });

  app.get('/auth/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/auth/:provider', AuthenticationController.authenticate);
  app.get('/auth/:provider/callback', AuthenticationController.callback);

  app.get('/#_=_', function(req, res, next) {
    return res.render('index', {});
  });
};