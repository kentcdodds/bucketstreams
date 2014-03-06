
var models = require('../model').models;
var schemas = require('../model').schemas;
var ref = require('../model/ref');
var _ = require('lodash-node');

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
   * Checks if the model created with the given query would pass validation. Responds with isValid and invalidFields.
   * @param model - param - The collection to create a test model for
   * @param query - query - the whole query will be used to create the model
   */
  app.get(prefixes.util + '/validate/:model', function(req, res) {
    var model = models[req.params.model];
    if (!model) return ErrorController.sendErrorJson(res, 400, 'No model called ' + req.params.model);
    var testModel = new model(req.query);
    testModel.validate(function(err) {
      var valid = !(err && err.errors);
      var invalidFields = null;
      if (!valid) {
        invalidFields = err.errors;
      }
      return res.json(200, {
        requestIndex: req.query.requestIndex,
        isValid: valid,
        invalidFields: invalidFields
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

              var postIds = _.pluck(posts, '_id');
              Comment.find({owningPost: {$in: postIds}}, function(err, comments) {
                if (err) return ErrorController.sendErrorJson(res, 500, err.message);
                var commentAuthors = _.pluck(comments, 'author');
                var postAuthors = _.pluck(posts, 'author');
                var streamOwners = [];
                var bucketOwners = [];
                if (one.subscriptions) {
                  Stream.find({'_id': {$in: [one.subscriptions.streams]}}, 'owner name', function (err, streams) {
                    if (err) return ErrorController.sendErrorJson(res, 500, err.message);
                    one.subscriptions.streamsInfo = streams;
                    streamOwners = _.pluck(streams, 'owner');
                    if (one.subscriptions.buckets.length) {
                      Bucket.find({'_id': {$in: [one.subscriptions.buckets]}}, 'owner name', function(err, buckets) {
                        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
                        one.subscriptions.bucketsInfo = buckets;
                        bucketOwners = _.pluck(buckets, 'owner');
                        cont();
                      });
                    } else {
                      cont();
                    }
                  });
                } else {
                  cont();
                }

                function cont() {
                  User.find({'_id': {$in: _.union(commentAuthors, postAuthors, streamOwners, bucketOwners)}}, '_id username name profilePicture', function(err, users) {
                    if (err) return ErrorController.sendErrorJson(res, 500, err.message);

                    _.each(comments, function(comment) {
                      comment._doc.authorInfo = _.find(users, {'_id': comment.author});
                    });
                    _.each(posts, function(post) {
                      post._doc.comments = _.where(comments, {owningPost: post._id});
                      post._doc.authorInfo = _.find(users, {'_id': post.author});
                    });
                    if (one.subscriptions) {
                      _.each(one.subscriptions.streamsInfo, function(streamInfo) {
                        streamInfo.ownerName = _.find(users, {'_id': streamInfo.owner});
                      });
                      _.each(one.subscriptions.bucketsInfo, function(bucketInfo) {
                        bucketInfo.ownerName = _.find(users, {'_id': bucketInfo.owner});
                      });
                    }
                    User.findOne({'_id': one.owner}, '_id username name profilePicture', function(err, user) {
                      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
                      var response = {};
                      response[type] = one;
                      response.posts = posts;
                      response.owner = user;
                      res.json(response);
                    });
                  });
                }
              });
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

  /**
   * Gets the data necessary for the post of the given id.
   * @param id - param - the id of the post
   */
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