module.exports = function(app) {
  require('./AngularRoutes')(app);
  require('./AuthenticationRoutes')(app);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
    require('../local/HelperRoutes')(app);
  }

  app.get('*', function(req, res) {
    console.log('catch all: ' + req.params);
    res.sendfile(app.get('directory') + '/app/index.html');
  });
};
