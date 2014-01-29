module.exports = function(app) {
  require('./AngularRoutes')(app);
  require('./AuthenticationRoutes')(app);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
    require('../local/HelperRoutes')(app);
  }

  var config = require('../views/config');

  app.get('/components', function(req, res) {
    console.log('rendering components page');
    console.log(config.components);
    res.render('main', config.components);
  });

  app.get('*', function(req, res) {
    console.log('catch all: ' + req.params);
    var configuration = config.authenticated;
    if (!req.isAuthenticated()) {
      console.log('sending anonymous');
      configuration = config.anonymous;
    }
    res.render('main', configuration);
  });
};
