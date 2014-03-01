
var models = require('../model').models;
var schemas = require('../model').schemas;
var ref = require('../model/ref');
var User = models[ref.user];
var Stream = models[ref.stream];
var Bucket = models[ref.bucket];
var StreamSchema = schemas[ref.stream];
var prefixes = require('./prefixes');
var RouteHelper = require('./RouteHelper');

var ErrorController = require('../controller/ErrorController');

module.exports = function(app) {

  /**
   * Checks if the value is unique for the field in the collection.
   * @param collection - route - The collection to check
   * @param field - query - The field to check against
   * @param value - query - The value to check for uniqueness
   */
  app.get(prefixes.util + '/unique/:collection', function(req, res) {
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


  /**
   * Gets the posts in the stream with the given id
   * @param id - route - The id of the stream to get posts for
   * @param offset - query - The offset of posts to start at - NOT YET IMPLEMENTED
   * @param limit - query - The number of posts to return - NOT YET IMPLEMENTED
   */
  app.get(prefixes.util + '/streams/:id/posts', function(req, res, next) {
    StreamSchema.getPostsById(req.params.id, function(err, posts) {
      if (err) return ErrorController.sendErrorJson(res, 500, 'Problem getting stream posts: ' + err.message);
      res.json(200, posts);
    });
  });


  /**
   * Helper function for loading a stream page.
   * @param streamName - query - The name of the stream
   * @param username - query - The name of the user who owns the stream
   * @returns streamData - A stream and posts (with the post's comments attached to the post object)
   */
  app.get(prefixes.util + '/streamData', function(req, res, next) {
    if (req.query.streamName && req.query.username) {
      req.query.name = req.query.streamName;
      delete req.query.streamName;
      RouteHelper.convertUsernameQueryToId(req, 'owner', function() {
        Stream.findOne(req.query, function(err, stream) {
          if (err) return ErrorController.sendErrorJson(res, 500, err.message);
          if (!stream) return ErrorController.sendErrorJson(res, 400, 'No stream with the name ' + req.query.name);
          stream.getPosts(function(err, posts) {
            if (err) return ErrorController.sendErrorJson(res, 500, err.message);
            res.json({
              stream: stream,
              posts: posts
            });
          });
        });
      });
    } else {
      next();
    }
  });

};