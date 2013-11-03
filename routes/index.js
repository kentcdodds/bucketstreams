module.exports = function(app) {
  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/',
    requestPrehandler: function(req, res, next) {
      console.log('Request pre-handler!');
    }
  });

  var dataModels = require('../model').models;
  for (var model in dataModels) {
    angularBridge.addResource(model, dataModels[model]);
  }

  app.get('/', function(req, res, next) {
    res.render('index',{});
  });
};
