'use strict';

var passport = require('passport');
var ErrorController = require('./ErrorController');
var User = require('../model/User').model;

var authenticateTo = {
  facebook: function(req, res, next) {
    passport.authenticate('facebook')(req, res, next);
  },
  twitter: function(req, res, next) {
    passport.authenticate('twitter')(req, res, next);
  },
  google: function(req, res, next) {
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    })(req, res, next);
  }
};

var callbackFrom = {
  facebook: function(req, res, next) {
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/facebook-failure'
    })(req, res, next);
  },
  twitter: function(req, res, next) {
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/twitter-failure'
    })(req, res, next);
  },
  google: function(req, res, next) {
    passport.authenticate('google', {
      successRedirect: '/',
      failureRedirect: '/google-failure'
    })(req, res, next);
  }
};


function sendUnsupportedProviderError(res, provider) {
  var message = 'The third-party provider "' + provider + '" is not supported';
  var code = 400;
  ErrorController.sendErrorJson(res, code, message);
}

/*
 * Export interface
 */
module.exports = {
  authenticate: function(req, res, next) {
    var authFunction = authenticateTo[req.params.provider];
    if (authFunction) {
      authFunction(req, res, next);
    } else {
      sendUnsupportedProviderError(res, req.params.provider);
    }
  },
  callback: function(req, res, next) {
    var callbackFunction = callbackFrom[req.params.provider];
    if (callbackFunction) {
      callbackFunction(req, res, next);
    } else {
      sendUnsupportedProviderError(res, req.params.provider);
    }
  }
};