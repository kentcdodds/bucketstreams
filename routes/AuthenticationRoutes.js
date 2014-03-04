'use strict';

var AuthenticationController = require('../controller/AuthenticationController');
var ErrorController = require('../controller/ErrorController');
var async = require('async');
var passport = require('passport');
var prefix = require('./prefixes');

var models = require('../model').models;
var ref = require('../model/ref');
var User = models[ref.user];
var Stream = models[ref.stream];
var Bucket = models[ref.bucket];

module.exports = function(app) {
  app.post(prefix.auth + '/register', function(req, res) {
    function sendError(err) {
      ErrorController.sendErrorJson(res, 400, 'Sign Up Error: ' + err.message);
    }
    var newUser = new User({
      email: req.body.email
    });
    User.register(newUser, req.body.password, function(err, user) {
      if (err) return sendError(err);
      function createMainStream(done) {
        new Stream({
          owner: user.id,
          name: 'Main Stream',
          isMain: true
        }).save(function(err, mainStream) {
            if (err) return done(err);
            user.mainStream = mainStream.id;
            done();
          });
      }

      function createMainBucket(done) {
        new Bucket({
          owner: user.id,
          name: 'Main Bucket',
          isMain: true
        }).save(function(err, mainBucket) {
            if (err) return done(err);
            user.mainBucket = mainBucket.id;
            done();
          });
      }

      function login(done) {
        req.login(user, done);
      }

      function runParallel(done) {
        async.parallel([createMainStream, createMainBucket, login], done);
      }

      function saveUser(done) {
        user.save(done);
      }

      async.series([runParallel, saveUser], function(err, results) {
        if (err) return sendError(err);

        return res.json(200, results[1]);
      });
    });
  });


  app.post(prefix.auth + '/login', function(req, res, next) {

    function convertUsernameToEmail(username, cb) {
      if (/@/.test(username)) {
        cb(null, username);
      } else {
        User.findOne({ username: username }, 'email', function (err, user) {
          cb(err, (user ? user.email : null));
        });
      }
    }

    convertUsernameToEmail(req.body.username, function(err, email) {
      req.body.email = email;
      passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);

        if (!user) {
          return ErrorController.sendErrorJson(res, 403, 'Username or Password incorrect.');
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

  app.get(prefix.auth + '/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get(prefix.auth + '/third-party/:provider', AuthenticationController.authenticate);
  app.get(prefix.auth + '/third-party/:provider/callback', AuthenticationController.callback);
};