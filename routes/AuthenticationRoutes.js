'use strict';

var AuthenticationRoutes = (function() {
  var AuthenticationController = require('../controller/AuthenticationController');
  return {
    setupRoutes: function(app) {
      app.get('/auth/logout', function(req, res) {
        req.logout();
        res.redirect('/');
      });

      app.get('/auth/:provider', AuthenticationController.authenticate);
      app.get('/auth/:provider/callback', AuthenticationController.callback);

      app.get('/#_=_', function(req, res, next) {
        return res.render('index', {});
      });
    }
  };
})();

module.exports = AuthenticationRoutes;