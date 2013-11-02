module.exports = function(app) {
  var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix : '/api/'
  });

  var dataModels = require('../model').models;
//  for (var model in dataModels) {
//    angularBridge.addResource(model, dataModels[model]);
//  }

  var mockUser = new dataModels.user({
    name: 'Test User 1',
    handle: 'testuser1'
  });
  console.log(mockUser);
  console.log(mockUser.id);
  console.log(mockUser._id);
  var mockBucket = new dataModels.bucket({
    owner: mockUser._id,
    name: 'Test Bucket',
    visibility: [],
    contributors: [mockUser._id]
  });
  mockBucket.save(function(err) {
    console.log(err);
  });
  app.get('/', function(req, res, next) {
    res.render('index',{});
  });
};
