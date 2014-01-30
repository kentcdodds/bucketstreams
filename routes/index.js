module.exports = function(app) {
  require('./AngularRoutes')(app);
  require('./AuthenticationRoutes')(app);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
    require('../local/HelperRoutes')(app);
  }


  var config = require('../views/config');

  app.get('/user/:username', function(req, res) {
    res.render('main', config.main);
  });

  app.get('/components', function(req, res) {
    console.log('rendering components page');
    console.log(config.components);
    res.render('main', config.components);
  });

  app.get('/', function(req, res, next) {
    if (!req.isAuthenticated()) {
      console.log('sending front-page');
      res.render('main', config.frontPage);
    } else {
      next();
    }
  });

  app.get('*', function(req, res) {
    console.log('catch all: ' + req.params, 'sending main');
    res.render('main', config.main);
  });
};
