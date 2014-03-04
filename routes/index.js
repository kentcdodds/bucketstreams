var logger = require('winston');
module.exports = function(app) {
  require('./CustomMiddleware')(app);
  require('./UtilRoutes')(app);
  require('./AuthenticationRoutes')(app);
  require('./PhotoRoutes')(app);
  require('./RestRoutes')(app);
  require('./SEORoutes')(app);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
    require('../local/HelperRoutes')(app);
  }

  var config = require('../views/config');

  app.get('/user/:username', function(req, res) {
    res.render('main', config.main);
  });

  app.get('/components', function(req, res) {
    logger.info('rendering components page');
    res.render('main', config.components);
  });

  var unauthFrontPages = ['', 'signup', 'login'];

  app.get('(/' + unauthFrontPages.join('|/') + ')', function(req, res, next) {
    if (!req.isAuthenticated() || req.session.visitor) {
      logger.info('sending front-page');
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
    logger.info('catch all: ' + req.params);
    if (req.session.visitor || !req.isAuthenticated()) {
      logger.info('sending frontPage');
      res.render('main', config.frontPage);
    } else {
      logger.info('sending main');
      res.render('main', config.main);
    }
  });
};
