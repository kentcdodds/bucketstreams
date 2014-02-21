'use strict';

var AuthenticationController = require('../controller/AuthenticationController');
var ErrorController = require('../controller/ErrorController');
var async = require('async');
var passport = require('passport');

var models = require('../model').models;
var ref = require('../model/ref');
var User = models[ref.user];
var Stream = models[ref.stream];
var Bucket = models[ref.bucket];

module.exports = function(app) {
  app.post('/register', function(req, res) {
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
        async.parallel([createMainStream, createMainBucket, login], function(err) {
          if (err) return done(err);
          done();
        });
      }

      function saveUser(done) {
        user.save(function(err, savedUser) {
          done(err, savedUser);
        });
      }

      async.series([runParallel, saveUser], function(err, results) {
        if (err) return sendError(err);

        return res.json(200, results[1]);
      });
    });
  });


  app.post('/login', function(req, res, next) {

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

  app.get('/auth/logout', function(req, res) {
    req.logout();
    console.log('logged out, redirecting');
    res.redirect('/');
  });

  app.get('/auth/:provider', AuthenticationController.authenticate);
  app.get('/auth/:provider/callback', AuthenticationController.callback);
};