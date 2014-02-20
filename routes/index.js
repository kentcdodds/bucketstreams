module.exports = function(app) {
  require('./AngularRoutes')(app);
  require('./AuthenticationRoutes')(app);
  require('./PhotoRoutes')(app);
  require('./UtilRoutes')(app);

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

  var unauthFrontPages = ['', 'signup', 'login'];

  app.get('(/' + unauthFrontPages.join('|/') + ')', function(req, res, next) {
    if (!req.isAuthenticated() || req.session.visitor) {
      console.log('sending front-page');
      res.render('main', config.frontPage);
    } else {
      next();
    }
  });

  var anyFrontPages = ['interest', 'interest/:provider'];

  app.get('(/' + anyFrontPages.join('|/') + ')', function(req, res) {
    console.log('sending frontPage for interest game', req.params);
    if (req.isAuthenticated()) {
      console.log('even though the user is authenticated');
    }
    res.render('main', config.frontPage);
  });

  app.get('*', function(req, res) {
    console.log('catch all: ' + req.params);
    if (req.session.visitor || !req.isAuthenticated()) {
      console.log('sending frontPage');
      res.render('main', config.frontPage);
    } else {
      console.log('sending main');
      res.render('main', config.main);
    }
  });
};
