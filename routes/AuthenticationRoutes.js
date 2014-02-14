'use strict';

var AuthenticationController = require('../controller/AuthenticationController');
var ErrorController = require('../controller/ErrorController');
var User = require('../model/User').model;
var passport = require('passport');

module.exports = function(app) {
  app.post('/register', function(req, res) {
    User.register(new User({ email : req.body.email }), req.body.password, function(err, user) {
      if (err) return ErrorController.sendErrorJson(res, 400, 'Problem registering user. Error:\n' + JSON.stringify(err, null, 2));

      req.login(user, function(err) {
        if (err) return ErrorController.sendErrorJson(res, 400, 'Problem automatically logging in user. Error: \n' + JSON.stringify(err, null, 2));

        return res.json(200, user);
      });
    });
  });

  function convertUsernameToEmail(username, cb) {
    if (/@/.test(username)) {
      cb(null, username);
    } else {
      User.findOne({ username: username }, 'email', function (err, user) {
        cb(err, (user ? user.email : null));
      });
    }
  }

  app.post('/login', function(req, res, next) {
    convertUsernameToEmail(req.body.username, function(err, email) {
      req.body.email = email;
      passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);

        if (!user) {
          return ErrorController.sendErrorJson(res, 403, 'No such user exists');
        }

        req.logIn(user, function(err) {
          if (err) return next(err);
          req.user.updateLastLoginTime(function() {
            return res.json(200, req.user);
          });
        });
      })(req, res, next);
    });
  });

  app.get('/auth/logout', function(req, res) {
    req.logout();
    console.log('logged out, redirecting');
    res.redirect('/');
  });

  app.get('/auth/:provider', AuthenticationController.authenticate);
  app.get('/auth/:provider/callback', AuthenticationController.callback);
};