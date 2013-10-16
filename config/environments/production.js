var express = require('express'),
  path = require('path');

module.exports = function(app) {
  app.configure('production', function() {
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 9000);
    app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1');
    app.set('views', path.join(app.directory, '/dist'));
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(express.static(app.directory + '/dist'));
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(app.directory, 'dist')));
  });
};
