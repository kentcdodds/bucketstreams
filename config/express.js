var passport = require('passport');
var express = require('express');

module.exports = function(app) {

  // Setup express
  if (process.env.NODE_ENV === 'production') {
    process.env.BASE_URL = 'http://www.bucketstreams.com';
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 9000);
    app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
  //    app.use(express.cookieParser('Rock Run Slime George'));
  } else {
    app.set('port', process.env.PORT || 9000);
    app.set('ip', process.env.IP || '127.0.0.1');
    app.use(express.errorHandler());
  }

  app.set('views', app.directory + '/app');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser('Toy Lion Story King'));
  app.use(express.session({secret: 'medusa red podium'}));

  app.use(express.static(app.directory + '/app'));

  app.use(passport.initialize());
  app.use(passport.session());
}