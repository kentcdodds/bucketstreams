'use strict';

var AuthenticationController = require('../controller/AuthenticationController');
var ErrorController = require('../controller/ErrorController');
var EmailController = require('../controller/EmailController');
var async = require('async');
var moment = require('moment');
var uuid = require('node-uuid');
var passport = require('passport');
var prefix = require('./prefixes');
var config = require('../views/config');

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
      email: req.body.email,
      emailConfirmation: {
        secret: uuid.v4()
      }
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
      
      function sendConfirmationEmail(done) {
        EmailController.sendEmailConfirmationEmail(user, function(err, result) {
          if (err) return sendError(err);
          user.emailConfirmation.emailSent = new Date();
          user.save(done);
        });
      }

      function runParallel(done) {
        async.parallel([createMainStream, createMainBucket, login], done);
      }

      function saveUser(done) {
        user.save(done);
      }

      async.series([runParallel, saveUser, sendConfirmationEmail], function(err, results) {
        if (err) return sendError(err);

        return res.json(200, results[2]);
      });
    });
  });
  
  app.get(prefix.auth + '/isAuthenticated', function(req, res) {
    res.json({
      isAuthenticated: req.isAuthenticated()
    });
  });

  app.post(prefix.auth + '/confirm-email/resend', function(req, res) {
    if (req.isAuthenticated) {
      sendEmail(req.user);
    } else if (req.body.email) {
      User.getUserByUsernameOrEmail(req.body.email, function(err, user) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        sendEmail(user);
      });
    }
    
    function sendEmail(user) {
      if (user.emailConfirmation.confirmed) {
        return res.json({
          sent: false,
          reason: 'User with email ' + user.email + ' is already confirmed.'
        });
      }
      user.secret = uuid.v4();
      EmailController.sendEmailConfirmationEmail(user, function(err, result) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        user.emailConfirmation.emailSent = new Date();
        user.save(function(err, user) {
          if (err) return ErrorController.sendErrorJson(res, 500, err.message);
          res.json({
            sent: true
          });
        });
      });
    }
  });
  
  app.get(prefix.auth + '/confirm-email/:secret', function(req, res) {
    function maybeSendError(err) {
      if (!err) return;
      res.json({
        success: false,
        type: 'internal-error',
        message: err.message
      });
      return true;
    }
    User.findByEmailConfirmationSecret(req.params.secret, function(err, user) {
      if (maybeSendError(err)) return;
      if (!user) {
        return res.json({
          success: false,
          type: 'invalid-link'
        });
      } else if (user.emailConfirmation.confirmed) {
        return res.json({
          success: false,
          user: user,
          type: 'already-confirmed'
        });
      } else if (moment(user.emailConfirmation.emailSent).diff(moment(), 'days') > 1) {
        return res.json({
          success: false,
          user: user,
          type: 'expired-link'
        });
      }
      user.confirm(function(err, user) {
        if (maybeSendError(err)) return;
        req.login(user, function(err) {
          if (maybeSendError(err)) return;
          res.json({
            success: true,
            user: user,
            type: 'success'
          });
        });
      });
    });
  });


  app.post(prefix.auth + '/login', function(req, res, next) {
    User.getEmailFromUsername(req.body.username, function(err, email) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
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
  
  app.post(prefix.auth + '/reset-password', function(req, res) {
    User.getUserByUsernameOrEmail(req.body.username, function(err, user) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
      user.setupPasswordReset(function(err, user) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        EmailController.sendPasswordResetEmail(user, function(err, result) {
          if (err) return ErrorController.sendErrorJson(res, 500, err.message);
          res.json({
            success: true,
            message: 'Check ' + user.email + ' for a link to reset your password.'
          })
        });
      });
    });
  });

  app.get(prefix.auth + '/reset-password/:secret', function(req, res) {
    User.findByPasswordResetSecret(req.params.secret, function(err, user) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
      res.json(user);
    });
  });


  app.post(prefix.auth + '/reset-password/:secret', function(req, res) {
    if (!req.body.newPassword) return ErrorController.sendErrorJson(res, 400, 'Must set a new password.');
    User.findByPasswordResetSecret(req.params.secret, function(err, user) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
      if (!user) {
        return res.json({
          success: false,
          type: 'invalid-link'
        });
      } else if (moment(user.passwordReset.emailSent).diff(moment(), 'hours') > 2) {
        return res.json({
          success: false,
          user: user,
          type: 'expired-link'
        });
      }
      user.setPassword(req.body.newPassword, function(err, user) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        res.redirect('/');
      });
    });
  });

  app.get(prefix.auth + '/third-party/:provider', AuthenticationController.authenticate);
  app.get(prefix.auth + '/third-party/:provider/callback', AuthenticationController.callback);
};