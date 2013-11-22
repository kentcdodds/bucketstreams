'use strict';

var AuthenticationController = (function() {
  var logger = require('winston');
  var passport = require('passport');
  var ErrorController = require('./ErrorController');
  var User = require('../model/User').model;

  var authenticateTo;
  var callbackFrom;
  var configure;
  var handleAuthenticatedUser;
  var sendUnsupportedProviderError;

  authenticateTo = {
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

  callbackFrom = {
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


  handleAuthenticatedUser = function(provider, req, accessToken, refreshToken, profile, done) {
    if (!req.isAuthenticated()) {
      console.log(provider, profile.id);
//      User.findOne({'connectedAccounts.provider': 'facebook', 'connectedAccounts.accessToken': 'CAAIto8YHkMsBADK4zwqHCBLsl9GAXknH2JMqrLGav0yzKYZBgGPZCLIwIBPCQJflJdGMYRJf3ZAehJVB5RkLB0s0phispOSTsaUrVlZCJ2ia8JZBgCEFFVkQI4MwddLZAgGCZCchGeDa4NvpGR3dZCpaPbVpfUsnFFD6W65vIBJ3P3Y0kl3j4TZBA1uiZCDpxdcLEZD'}, function(err, user) {
      User.findOne({'connectedAccounts.provider': provider, 'connectedAccounts.accountId': profile.id}, function(err, user) {
        if (err) return done(err);
        if (!user) return done(new Error('User does not exist. Cannot connect account.'));

        req.login(user, function(err) {
          if (err) return done(err);

          return done(null, user);
        });
      });
    } else {
      req.user.connect(provider, accessToken, refreshToken, profile, function(err, user) {
        if (err) return done(err);

        return done(null, user);
      });
    }
  };

  configure = {
    facebook: function() {
      var FacebookStrategy = require('passport-facebook').Strategy;
      passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/facebook/callback",
        passReqToCallback: true
      },
        function(req, accessToken, refreshToken, profile, done) {
          handleAuthenticatedUser('facebook', req, accessToken, refreshToken, profile, done);
        }));
    },
    twitter: function() {
      var TwitterStrategy = require('passport-twitter').Strategy;
      passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/twitter/callback",
        passReqToCallback: true
      },
        function(req, accessToken, refreshToken, profile, done) {
          handleAuthenticatedUser('twitter', req, accessToken, refreshToken, profile, done);
        }));
    },
    google: function() {
      var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/google/callback",
        passReqToCallback: true
      },
        function(req, accessToken, refreshToken, profile, done) {
          handleAuthenticatedUser('google', req, accessToken, refreshToken, profile, done);
        }));
    }
  };

  sendUnsupportedProviderError = function(res, provider) {
    var message = 'The third-party provider "' + provider + '" is not supported';
    var code = 400;
    ErrorController.sendErrorJson(res, code, message);
  };

  return {
    setupPassport: function() {
      var User = require('../model/User').model;
      passport.use(User.createStrategy());

      // use static serialize and deserialize of model for passport session support
      configure.facebook();
      configure.twitter();
      configure.google();

      passport.serializeUser(User.serializeUser());
      passport.deserializeUser(User.deserializeUser());
    },
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
})();

module.exports = AuthenticationController;