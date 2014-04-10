'use strict';

var passport = require('passport');
var ErrorController = require('./ErrorController');
var User = require('../model/User').model;

var authenticateTo = {
  facebook: function(req, res, next) {
    passport.authenticate('facebook', {scope: 'read_stream'})(req, res, next);
  },
  twitter: function(req, res, next) {
    passport.authenticate('twitter')(req, res, next);
  },
  google: function(req, res, next) {
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/plus.login'
      ]
    })(req, res, next);
  }
};

var providers = ['facebook', 'twitter', 'google'];

function checkUnsupportedProvider(res, provider) {
  if (providers.indexOf(provider) === -1) {
    var message = 'The third-party provider "' + provider + '" is not supported';
    var code = 400;
    ErrorController.sendErrorJson(res, code, message);
  }
}

/*
 * Export interface
 */
module.exports = {
  authenticate: function(req, res, next) {
    var provider = req.params.provider;
    checkUnsupportedProvider(res, provider);
    authenticateTo[provider](req, res, next);
  },
  callback: function(req, res, next) {
    var provider = req.params.provider;
    checkUnsupportedProvider(res, provider);

    passport.authenticate(provider, {
      successRedirect: '/',
      failureRedirect: '/'
    })(req, res, next);
  },
  checkAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      ErrorController.sendErrorJson(res, 401);
    }
  }
};