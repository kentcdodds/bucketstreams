
var models = require('../model').models;
var ref = require('../model/ref');
var User = models[ref.user];
var Stream = models[ref.stream];
var Bucket = models[ref.bucket];

var ErrorController = require('../controller/ErrorController');

module.exports = function(app) {
  app.get('/api/v1/unique/:collection', function(req, res) {
    var query = {};
    query[req.query.field] = new RegExp('^' + req.query.value + '$', 'i');
    var collection = ref[req.params.collection];
    if (!collection) {
      return ErrorController.sendErrorJson(res, 400, 'No collection named ' + req.params.collection);
    }
    models[collection].find(query, '_id', function(err, results) {
      if (err) return ErrorController.sendErrorJson(res, 400, 'Problem finding user. Error:\n' + JSON.stringify(err, null, 2));
      res.json(200, {
        isUnique: !results.length,
        count: results.length
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