var passport = require('passport');
var path = require('path');
var logger = require('winston');

var expressJwt = require('express-jwt');

var express = require('express');
var cookieParser = require('cookie-parser');
var errorhandler = require('errorhandler');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var serveStatic = require('serve-static');
var staticFavicon = require('static-favicon');
var compression = require('compression');
var morgan = require('morgan');

var User = require('../model/User').model;

module.exports = function(app) {

  // Setup express
  var skip = [];
  var tokenMiddleware = expressJwt({secret: 'h$|24X5.1g44P05#6Z8>', skip: skip});
  app.get('/api/**', tokenMiddleware, function(req, res, next) {
    if (req.user) {
      var id = req.user.id;
      req.user = new User(req.user);
      req.user._id = id;
    }
    next();
  });

  if (/production|alpha/.test(process.env.NODE_ENV)) {
    logger.info('Setting express up with production-level stuff');
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 9000);
    app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
    app.use(cookieParser('ki7%"6j-":8198h<7=]P'));
    app.use(compression());
  } else {
    logger.info('Setting express up with development-level stuff');
    app.set('port', process.env.PORT || 9000);
    app.set('ip', process.env.IP || '127.0.0.1');
    app.use(errorhandler());
    app.use(cookieParser('oi%j**A^&d)N;!-{6"|'));
    app.use(morgan('dev'));
    app.locals.pretty = true;

    //CORS middleware for development
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');

      next();
    });

  }

  app.disable('x-powered-by');
  app.set('view engine', 'jade');
  app.engine('jade', require('jade').__express);
  app.set('views', path.resolve('./server/views'));

  app.use(staticFavicon(path.resolve('./public/images/favicon.png')));
  app.use(bodyParser());
  app.use(methodOverride());

  app.use(serveStatic(path.resolve('./public')));

  app.use(passport.initialize());

  if (process.env.hideBucketStreams === 'true') {
    app.all('*', function (req, res, next) {
      function askForAuth(res) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Please authenticate"');
        res.end('Unauthorized');
      }

      var authorization = req.headers.authorization;
      if (!authorization) return askForAuth(res);

      var token = authorization.split(/\s+/).pop() || '';
      var auth = new Buffer(token, 'base64').toString();
      var parts = auth.split(/:/);
      var username = parts[0];
      var password = parts[1];
      if (username === process.env.hideBSUsername && password === process.env.hideBSPassword) {
        next();
      } else {
        askForAuth(res);
      }
    });
  }
};