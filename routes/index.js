var dataModels = require('../model').models;

module.exports = function(app) {
  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/v1/',
    requestPrehandler: function(req, res, next) {
      console.log(req);
      next();
    }
  });

  for (var model in dataModels) {
    angularBridge.addResource(model, dataModels[model]);
  }

  app.get('/', function(req, res, next) {
    console.log('rendering index');
    res.render('index',{});
  });
};
