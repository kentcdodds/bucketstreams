
var models = require('../model').models;
var schemas = require('../model').schemas;
var ref = require('../model/ref');

var User = models[ref.user];
var Stream = models[ref.stream];
var Bucket = models[ref.bucket];
var Post = models[ref.post];
var Comment = models[ref.comment];

var StreamSchema = schemas[ref.stream];
var prefixes = require('./prefixes');
var RouteHelper = require('./RouteHelper');

var ErrorController = require('../controller/ErrorController');

module.exports = function(app) {

  /**
   * Checks if the username is valid
   * @param username - query - The username to check validity for
   */
  app.get(prefixes.util + '/validate/username', function(req, res) {
    var username = req.query.username;
    var testModel = new User({
      email: 'this_should_please_be_unique_and_valid_43423572397598317@example.com',
      username: username
    });
    testModel.validate(function(err) {
      var valid = true;
      var type = 'available';
      if (err && err.errors) {
        valid = false;
        if (err.errors.username) {
          type = err.errors.username.type;
        } else {
          type = 'invalid for unknown reasons...';
        }
      }
      return res.json(200, {
        isValid: valid,
        message: '"' + username + '" is ' + type + '!',
        type: type
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
   * Helper function for loading a stream or bucket page.
   * @param streamName - query - The name of the stream/bucket
   * @param username - query - The name of the user who owns the stream/bucket
   * @returns data - A stream/bucket and posts (with the post's comments attached to the post object)
   */
  app.get(prefixes.util + '/data/:type', function(req, res, next) {
    var type = req.params.type;
    if (type === 'stream' || type === 'bucket') {
      if (req.query.name && req.query.username) {
        RouteHelper.convertUsernameQueryToId(req, 'owner', function() {
          models[type].findOne(req.query, function(err, one) {
            if (err) return ErrorController.sendErrorJson(res, 500, err.message);
            if (!one) return ErrorController.sendErrorJson(res, 404, 'No ' + type + ' with the name ' + req.query.name);
            one.getPosts(function(err, posts) {
              if (err) return ErrorController.sendErrorJson(res, 500, err.message);
              var response = {};
              response[type] = one;
              response.posts = posts;
              res.json(response);
            });
          });
        });
      } else {
        next();
      }
    } else {
      next();
    }
  });

  app.get(prefixes.util + '/data/post/:id', function(req, res, next) {
    Post.findOne({_id: req.params.id }, function(err, post) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
      if (!post) return ErrorController.sendErrorJson(res, 404, 'No post with the id ' + req.query.id);

      Comment.find({owningPost: req.params.id}, function(err, comments) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        post._doc.comments = comments;
        res.json(post);
      });
    });
  });

};