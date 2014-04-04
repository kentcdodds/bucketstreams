module.exports = function() {

  var passport = require('passport');
  var User = require('../model/User').model;

  function connectUser(tokenizedUser, options, done) {
    User.deTokenize(tokenizedUser, function(err, user) {
      if (err) return done(err);
      user.connect(options, done);
    })
  }

  var configure = {
    facebook: function() {
      var FacebookStrategy = require('passport-facebook').Strategy;
      passport.use(new FacebookStrategy({
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_SECRET,
          callbackURL: process.env.BASE_URL + '/third-party/facebook/callback',
          passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
          connectUser(req.user, {
            provider: 'facebook',
            token: accessToken,
            refreshToken: refreshToken,
            profile: profile
          }, done);
        }));
    },
    twitter: function() {
      var TwitterStrategy = require('passport-twitter').Strategy;
      passport.use(new TwitterStrategy({
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
          callbackURL: process.env.BASE_URL + '/third-party/twitter/callback',
          passReqToCallback: true
        },
        function(req, accessToken, secret, profile, done) {
          connectUser(req.user, {
            provider: 'twitter',
            token: accessToken,
            secret: secret,
            profile: profile
          }, done);
        }));
    },
    google: function() {
      var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
      passport.use(new GoogleStrategy({
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.BASE_URL + '/third-party/google/callback',
          passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
          connectUser(req.user, {
            provider: 'google',
            token: accessToken,
            refreshToken: refreshToken,
            profile: profile
          }, done);
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