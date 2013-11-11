module.exports = function(app) {
  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/v1/',
    requestPrehandler: function(req, res, next) {
      console.log('Request pre-handler!');
      next();
    }
  });

  var dataModels = require('../model').models;
  for (var model in dataModels) {
    angularBridge.addResource(model + 's', dataModels[model]);
  }

  app.get('/test', function(req, res, next) {
    dataModels.user.find({}, function(err, docs) {
      if (!err) {
        res.json(docs);
      } else {
        res.send('ERROR!');
      }
    });
  });

  app.get('/', function(req, res, next) {
    res.render('index',{});
  });
};
