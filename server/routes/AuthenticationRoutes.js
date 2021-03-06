'use strict';

var AuthenticationController = require('../controller/AuthenticationController');
var ErrorController = require('../controller/ErrorController');
var EmailController = require('../controller/EmailController');
var async = require('async');
var moment = require('moment');
var uuid = require('node-uuid');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var prefix = require('./prefixes');
var config = require('../views/config');

var models = require('../model').models;
var ref = require('../model/ref');
var User = models[ref.user];
var Stream = models[ref.stream];
var Bucket = models[ref.bucket];

module.exports = function(app) {

  function sendToken(res, user) {
    var token = jwt.sign(user.getTokenObject(), process.env.EXPRESS_JWT_CODE);
    return res.json({ token: token });
  }
  
  app.post(prefix.auth + '/register', function(req, res) {
    function sendError(err) {
      ErrorController.sendErrorJson(res, 400, 'Sign Up Error: ' + err.message);
    }
    var newUser = new User({
      email: req.body.email,
      hidden: {
        secrets: {
          emailConfirmation: uuid.v4()
        }
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

      function runParallel(done) {
        async.parallel([createMainStream, createMainBucket], done);
      }

      function saveUser(done) {
        user.save(done);
      }

      function sendConfirmationEmail(done) {
        EmailController.sendEmailConfirmationEmail(user, function(err, result) {
          if (err) return sendError(err);
          user.extraInfo.emailConfirmationSent = new Date();
          user.save(done);
        });
      }
      async.series([runParallel, saveUser, sendConfirmationEmail], function(err, results) {
        if (err) return sendError(err);
        var user = results[2][0];
        return sendToken(res, user);
      });
    });
  });

  app.post(prefix.auth + '/confirm-email/resend', function(req, res) {
    if (req.isAuthenticated()) {
      User.deTokenize(req.user, function(err, user) {
        sendEmail(user);
      });
    } else if (req.body.email) {
      User.getUserByUsernameOrEmail(req.body.email, function(err, user) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        User.deTokenize(user, function(err, user) {
          sendEmail(user);
        });
      });
    }
    
    function sendEmail(user) {
      if (user.isConfirmed()) {
        return res.json({
          sent: false,
          reason: 'User with email ' + user.email + ' is already confirmed.'
        });
      }
      user.setupEmailConfirmationResend(function(err, user) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        EmailController.sendEmailConfirmationEmail(user, function(err, result) {
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
      } else if (user.isConfirmed()) {
        return res.json({
          success: false,
          userToken: user.getTokenObject(),
          type: 'already-confirmed'
        });
      } else if (user.emailConfirmationExpired()) {
        return res.json({
          success: false,
          userToken: user.getTokenObject(),
          type: 'expired-link'
        });
      }
      user.confirm(function(err, user) {
        if (maybeSendError(err)) return;
        res.json({
          success: true,
          userToken: user.getTokenObject(),
          type: 'success'
        });
      });
    });
  });


  app.post(prefix.auth + '/login', function(req, res, next) {
    User.getEmailFromUsername(req.body.email, function(err, email) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
      req.body.email = email;
      passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);

        if (!user) {
          return ErrorController.sendErrorJson(res, 403, 'Username or Password incorrect.');
        }

        user.updateLastLoginTime(function() {
          return sendToken(res, user);
        });
      })(req, res, next);
    });
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
  
  function handlePasswordResetSecret(req, res, callback) {
    function maybeSendError(err) {
      if (!err) return;
      res.json({
        user: null,
        result: {
          success: false,
          type: 'internal-error',
          message: err.message
        }
      });
      return true;
    }
    User.findByPasswordResetSecret(req.params.secret, function(err, user) {
      if (maybeSendError(err)) return;
      if (!user) {
        return res.json({
          user: null,
          result: {
            success: false,
            type: 'invalid-link'
          }
        });
      } else if (user.passwordResetUsed()) {
        return res.json({
          userToken: user.getTokenObject(),
          result: {
            success: false,
            type: 'already-confirmed'
          }
        });
      } else if (user.passwordResetExpired()) {
        return res.json({
          userToken: user.getTokenObject(),
          result: {
            success: false,
            type: 'expired-link'
          }
        });
      } else {
        callback(user);
      }
    });
  }
  
  
  app.get(prefix.auth + '/reset-password/:secret', function(req, res) {
    handlePasswordResetSecret(req, res, function(user) {
      res.json({
        userToken: user.getTokenObject(),
        result: {
          success: true,
          type: 'success'
        }
      });
    });
  });


  app.post(prefix.auth + '/reset-password/:secret', function(req, res) {
    if (!req.body.newPassword) return ErrorController.sendErrorJson(res, 400, 'Must set a new password.');
    handlePasswordResetSecret(req, res, function(user) {
      function sendInternalError() {
        return res.json({
          userToken: user.getTokenObject(),
          result: {
            success: false,
            type: 'internal-error',
            message: err.message
          }
        });
      }
      user.sendResetPasswordEmail(req.body.newPassword, function(err, user) {
        if (err) return sendInternalError();
        res.json({
          userToken: user.getTokenObject(),
          result: {
            success: true,
            type: 'success'
          }
        });
      });
    });
  });

  function decodeToken(req, res, next) {
    var validateJwt = expressJwt({secret: process.env.EXPRESS_JWT_CODE});
    validateJwt(req, res, next);
  }
  app.get('/third-party/:provider', AuthenticationController.authenticate);
  app.get('/third-party/:provider/callback', decodeToken, AuthenticationController.checkAuthenticated, AuthenticationController.callback);

  /**
   * Disconnects a user from the given provider
   */
  app.get(prefix.auth + '/disconnect/:provider', AuthenticationController.checkAuthenticated, function(req, res, next) {
    User.deTokenize(req.user, function(err, user) {
      if (err) return next(err);

      user.disconnect(req.params.provider, function(err, user) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        res.json({
          disconnected: true,
          provider: req.params.provider
        });
      });
    });
  });

  app.get(prefix.auth + '/get-profile-photo/:provider', AuthenticationController.checkAuthenticated, function(req, res) {
    User.deTokenize(req.user, function(err, user) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);

      user.setProfilePictureFromProvider(req.params.provider, function(err, user) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        res.json({
          pictureSet: true,
          provider: req.params.provider,
          profilePicture: user.profilePicture
        });
      });
    });
  });
};