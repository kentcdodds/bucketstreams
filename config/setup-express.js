var express = require('express');
var path = require('path');

module.exports = function(app) {

  var commonConfig = function() {
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    if (!process.env.LOCAL) {
      app.use(express.session());
    }
    app.use(app.router);
  };

  app.configure('development', function() {
    app.use(function staticsPlaceholder(req, res, next) {
      return next();
    });

    app.set('port', process.env.PORT || 9000);
    app.set('ip', process.env.IP || '127.0.0.1');
    app.set('views', path.join(app.directory, '/app'));
    app.use(express.static(app.directory + '/app'));
    app.use(express.cookieParser('Toy Lion Story King'));

    app.use(function middlewarePlaceholder(req, res, next) {
      return next();
    });

    app.use(express.errorHandler());
    commonConfig();
  });

  app.configure('production', function() {
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 9000);
    app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
    app.set('views', path.join(app.directory, '/dist'));
    app.use(express.static(app.directory + '/dist'));
    app.use(express.cookieParser('Rock Run Slime George'));
    app.use(express.static(path.join(app.directory, 'dist')));
    commonConfig();
  });

};
