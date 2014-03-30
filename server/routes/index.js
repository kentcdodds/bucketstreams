var logger = require('winston');
module.exports = function(app) {
  require('./CustomMiddleware')(app);
  require('./UtilRoutes')(app);
  require('./AuthenticationRoutes')(app);
  require('./PhotoRoutes')(app);
  require('./RestRoutes')(app);
  require('./SEORoutes')(app);

  if (!process.env.NODE_ENV || /local|development/.test(process.env.NODE_ENV)) {
    require('../local/HelperRoutes')(app);
  }

  var config = require('../views/config');

  app.get('*', function(req, res) {
    logger.info('catch all: ' + JSON.stringify(req.params, null, 2));
    logger.info('sending main');
    res.render('main', config.main);
  });
};
