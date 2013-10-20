var express = require('express');
var path = require('path');
console.log('required setup-express');

module.exports = function(app) {
  console.log('export of setup-express');
  console.log('app id: ' + process.env.OPENSHIFT_APP_UUID);
  console.log('environment: ' + process.env.NODE_ENV);
  console.log('environment from express: ' + app.get('env'));
  var commonConfig = function() {
    console.log('common config');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session());
    app.use(app.router);
  };

  app.configure('production', function() {
    console.log('production config');
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT);
    app.set('ip', process.env.OPENSHIFT_NODEJS_IP);
    app.set('views', path.join(app.directory, '/dist'));
    app.use(express.static(app.directory + '/dist'));
    app.use(express.cookieParser('Rock Run Slime George'));
    app.use(express.static(path.join(app.directory, 'dist')));
    commonConfig();
  });

  app.configure('development', function() {
    console.log('development config');
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

  console.log('Configuring finished');
};
