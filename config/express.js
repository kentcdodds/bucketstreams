var express = require('express');
var path = require('path');

module.exports = function(app) {
  var environmentConfig;
  var environment;

  if (process.env.OPENSHIFT_APP_UUID) {
    environment = 'production';
    environmentConfig = function productionSetup() {
      app.set('views', path.join(app.directory, '/dist'));
      app.use(express.static(app.directory + '/dist'));
      app.use(express.cookieParser('Rock Run Slime George'));
      app.use(express.static(path.join(app.directory, 'dist')));
    };

  } else {
    environment = 'development';

    environmentConfig = function developmentSetup() {
      app.use(function staticsPlaceholder(req, res, next) {
        return next();
      });

      app.set('views', path.join(app.directory, '/app'));
      app.use(express.static(app.directory + '/app'));
      app.use(express.cookieParser('Toy Lion Story King'));

      app.use(function middlewarePlaceholder(req, res, next) {
        return next();
      });

      app.use(express.errorHandler());
    };
  }
  app.configure(environment, function() {
    console.log('Configuring ' + environment);
    environmentConfig();

    //Common stuff
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 9000);
    app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session());
    app.use(app.router);
  });
};