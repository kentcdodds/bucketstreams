module.exports = function() {

  var passport = require('passport');
  var User = require('../model/User').model;
  var prefix = require('../routes/prefixes');

  function handleAuthenticatedUser(provider, req, token, secret, profile, done) {
    if (!req.isAuthenticated()) {
      if (req.params.temp) {
        profile.temp = true;
        req.login(profile, function(err) {
          if (err) return done(err);

          return done(null, profile);
        });
      }
      var query = {};
      query['connectedAccounts.' + provider + '.accountId'] = { $exists: true };
      User.findOne(query, function(err, user) {
        if (err) return done(err);
        if (!user) return done(new Error('User does not exist. Cannot connect account.'));

        req.login(user, function(err) {
          if (err) return done(err);

          return done(null, user);
        });
      });
    } else {
      req.user.connect(provider, token, secret, profile, function(err, user) {
        if (err) return done(err);

        return done(null, user);
      });
    }
  }

  var configure = {
    facebook: function() {
      var FacebookStrategy = require('passport-facebook').Strategy;
      passport.use(new FacebookStrategy({
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_SECRET,
          callbackURL: process.env.BASE_URL + prefix.auth + '/facebook/callback',
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
          callbackURL: process.env.BASE_URL + prefix.auth + '/twitter/callback',
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
          callbackURL: process.env.BASE_URL + prefix.auth + '/google/callback',
          passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
          handleAuthenticatedUser('google', req, accessToken, refreshToken, profile, done);
        }));
    }
  };


  /*
   * Configure passport
   */
  passport.use(User.createStrategy());

  // use static serialize and deserialize of model for passport session support
  configure.facebook();
  configure.twitter();
  configure.google();

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};