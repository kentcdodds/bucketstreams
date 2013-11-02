module.exports = function(app) {
  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/'
  });

  var dataModels = require('../model').models;
  for (var model in dataModels) {
    angularBridge.addResource(model, dataModels[model]);
  }

  app.get('/', function(req, res, next) {
    res.render('index',{});
  });
};
