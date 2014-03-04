var passport = require('passport');
var express = require('express');
var path = require('path');
var MongoStore = require('connect-mongo')(express);

module.exports = function(app) {

  // Setup express
  if (process.env.NODE_ENV === 'production') {
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 9000);
    app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
    app.use(express.cookieParser('Rock Run Slime George'));
    app.use(express.session({
      secret: 'Emily X-men Team Elephant Water',
      store: new MongoStore({
        url: process.env.MONGO_CONNECTION_STRING
      })
    }));
    app.use(express.compress());
  } else {
    app.set('port', process.env.PORT || 9000);
    app.set('ip', process.env.IP || '127.0.0.1');
    app.use(express.errorHandler());
    app.use(express.cookieParser('Toy Lion Story King'));
    app.use(express.session({secret: 'medusa red podium'}));
    app.use(express.logger('dev'));
    app.locals.pretty = true;
  }

  app.set('view engine', 'jade');
  app.engine('jade', require('jade').__express);
  app.set('views', app.get('directory') + '/views');

  app.use(express.favicon(app.get('directory') + '/app/images/favicon.png'));
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());

  app.use(express.static(path.join(app.get('directory'), 'app')));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  if (process.env.hideBucketStreams !== 'true') {
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