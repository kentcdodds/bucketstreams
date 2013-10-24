module.exports = function(app) {
  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/'
  });

  var data = require('../model/data');
  for (var model in data.models) {
    angularBridge.addResource(model, data.models[model]);
  }

  app.get('/', function(req, res, next) {
    res.render('index',{});
  });
};
