
var User = require('../model/User').model;
var ErrorController = require('../controller/ErrorController');

module.exports = function(app) {
  var utilPrefix = '/api/v1/util/';
  app.get(utilPrefix + 'username-unique', function(req, res) {
    User.findOne({username: new RegExp('^' + req.query.username + '$', 'i')}, 'username', function(err, user) {
      if (err) return ErrorController.sendErrorJson(res, 400, 'Problem finding user. Error:\n' + JSON.stringify(err, null, 2));
      var isUnique = !user;
      res.json(200, {
        isUnique: isUnique
      });
    });
  });
};