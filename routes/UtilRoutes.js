
var models = require('../model').models;
var ref = require('../model/ref');
var User = models[ref.user];
var Stream = models[ref.stream];
var Bucket = models[ref.bucket];

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

  app.get('/api/v1/streams/:id/posts', function(req, res, next) {
    Stream.findOne({_id: req.params.id}, function(err, stream) {
      if (err) return ErrorController.sendErrorJson(res, 500, 'Problem getting stream: ' + err.message);
      if (!stream) return ErrorController.sendErrorJson(res, 400, 'No stream with the id of ' + req.params.id);
      stream.getPosts(function(err, posts) {
        if (err) return ErrorController.sendErrorJson(res, 500, 'Problem getting stream posts: ' + err.message);
        res.json(200, posts);
      })
    });
  });
};