
var models = require('../model').models;
var ref = require('../model/ref');
var _ = require('lodash-node');
var async = require('async');
var Q = require('q');

var User = models[ref.user];
var Stream = models[ref.stream];
var Bucket = models[ref.bucket];
var Post = models[ref.post];
var Share = models[ref.share];
var Comment = models[ref.comment];

var prefixes = require('./prefixes');
var RouteHelper = require('./RouteHelper');

var ErrorController = require('../controller/ErrorController');
var AuthenticationController = require('../controller/AuthenticationController');

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



  /*
   * Helper function
   */
  function uniqueIds(allIds, objIds) {
    var union = _.union(allIds, objIds);
    return _.unique(union, function(objId) {
      return objId.id;
    });
  }


  /**
   * Helper function for loading a stream or bucket page.
   * @param streamName - query - The name of the stream/bucket
   * @param username - query - The name of the user who owns the stream/bucket
   * @returns data - A stream/bucket and posts (with the post's comments attached to the post object)
   */
  app.get(prefixes.util + '/data/:type(stream|bucket)', function(req, res, next) {
    if (!req.query.name || !req.query.username) return next();
    var type = req.params.type;
    var model = models[type];
    var isStream = type === 'stream';

    function deferredCallback(deferred) {
      return function(err, obj) {
        if (err) return deferred.reject(err);
        deferred.resolve(obj);
      }
    }

    // convert username to user id
    function convertUsername() {
      var deferred = Q.defer();
      RouteHelper.convertUsernameQueryToId(req, 'owner', deferredCallback(deferred));
      return deferred.promise;
    }

    // get a stream/bucket
    function getThing() {
      var deferred = Q.defer();
      model.findOne(req.query, deferredCallback(deferred));
      return deferred.promise;
    }

    // get posts
    function getPosts(responseBuilder) {
      var deferred = Q.defer();
      responseBuilder.thing.getPostsAndShares(function(err, postsAndShares) {
        if (err) return deferred.reject(err);
        var allPosts = _.union(postsAndShares.posts, postsAndShares.sharePosts);
        var shares = postsAndShares.shares;

        responseBuilder.posts = postsAndShares.posts;
        responseBuilder.sharePosts = _.reject(postsAndShares.sharePosts, function(post) {
          return _.find(postsAndShares.posts, {id: post.id});
        });
        responseBuilder.postIds = uniqueIds(_.pluck(allPosts, '_id'));
        responseBuilder.userIds = uniqueIds(responseBuilder.userIds, _.pluck(allPosts, 'author'));
        responseBuilder.bucketIds = uniqueIds(responseBuilder.bucketIds, _.flatten(_.pluck(allPosts, 'buckets')));



        responseBuilder.shares = shares;
        responseBuilder.shareIds = uniqueIds(_.pluck(shares, '_id'));
        responseBuilder.userIds = uniqueIds(responseBuilder.userIds, _.pluck(shares, 'author'));
        responseBuilder.bucketIds = uniqueIds(responseBuilder.bucketIds, _.flatten(_.pluck(shares, 'buckets')));
        
        deferred.resolve(responseBuilder);
      });
      return deferred.promise;
    }

    // get comments
    function getComments(responseBuilder) {
      var deferred = Q.defer();
      if (_.isEmpty(responseBuilder.postIds)) {
        return responseBuilder;
      }
      Comment.find({owningPost: {$in: responseBuilder.postIds}}, function(err, comments) {
        if (err) return deferred.reject(err);
        responseBuilder.comments = comments;
        responseBuilder.userIds = uniqueIds(responseBuilder.userIds, _.pluck(comments, 'author'));
        deferred.resolve(responseBuilder);
      });
      return deferred.promise;
    }

    // get subscription.bucket/stream info
    function getBucketsAndStreams(responseBuilder) {
      var bucketIds = responseBuilder.bucketIds;
      var streamIds = [];
      if (isStream) {
        bucketIds = _.union(bucketIds, responseBuilder.thing.subscriptions.buckets);
        streamIds = responseBuilder.thing.subscriptions.streams;
      }
      var deferred = Q.defer();
      var items = [];
      responseBuilder.subscriptionsInfo = {};
      if (!_.isEmpty(bucketIds)) {
        items.push({
          type: 'buckets',
          model: Bucket,
          ids: bucketIds
        });
      }
      if (!_.isEmpty(streamIds)) {
        items.push({
          type: 'streams',
          model: Stream,
          ids: streamIds
        });
      }
      async.concat(items, function(item, done) {
        item.model.find({'_id': {$in: item.ids}}, '_id owner name isMain', function(err, theThings) {
          if (err) return done(err);
          responseBuilder[item.type] = _.unique(_.union(responseBuilder[item.type], theThings), false, '_id');
          responseBuilder.userIds = uniqueIds(responseBuilder.userIds, _.pluck(theThings, 'owner'));
          done();
        });
      }, function(err, result) {
        if (err) return deferred.reject(err);
        deferred.resolve(responseBuilder);
      });
      return deferred.promise;
    }

    // get users for post.author, comment.author, subscription.streams.owner, subscription.buckets.owner, stream/bucket.owner
    function getUsers(responseBuilder) {
      var deferred = Q.defer();
      User.find({'_id': {$in: responseBuilder.userIds}}, '_id username name profilePicture', function(err, users) {
        if (err) return deferred.reject(err);
        responseBuilder.users = users;
        deferred.resolve(responseBuilder);
      });
      return deferred.promise;
    }

    // return result object
    function returnResult(rb) {
      res.json({
        type: rb.type,
        thing: rb.thing,
        users: rb.users,
        buckets: rb.buckets,
        streams: rb.streams,
        posts: rb.posts,
        shares: rb.shares,
        comments: rb.comments,
        sharePosts: rb.sharePosts
      });
    }
    
    // Start building the response.
    convertUsername().then(getThing).then(function(thing) {
      var responseBuilder = {
        type: type
      };
      responseBuilder.thing = thing;
      responseBuilder.userIds = [thing.owner];
      getPosts(responseBuilder)
        .then(getComments)
        .then(getBucketsAndStreams)
        .then(getUsers)
        .then(returnResult)
        .fail(function(err) {
          if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        });
    });
  });

  /**
   * Gets the data necessary for the post of the given id.
   * @param id - param - the id of the post
   */
  app.get(prefixes.util + '/data/post/:id', function(req, res, next) {
    Post.findOne({_id: req.params.id }, function(err, post) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
      if (!post) return ErrorController.sendErrorJson(res, 404, 'No post with the id ' + req.query.id);
      var allIds = [post.author];
      Comment.find({owningPost: req.params.id}, function(err, comments) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        allIds = uniqueIds(allIds, _.pluck(comments, 'author'));
        User.find({_id: { $in: allIds } }, '_id username name profilePicture', function(err, users) {
          if (err) return ErrorController.sendErrorJson(res, 500, err.message);

          res.json({
            post: post,
            comments: comments,
            users: users
          });
        });
      });
    });
  });

  /**
   * Runs the import process for the currently logged in user
   */
  app.get(prefixes.util + '/run-manual-import', AuthenticationController.checkAuthenticated, function(req, res, next) {
    User.deTokenize(req.user, function(err, user) {
      if (err) return next(err);
      user.importPosts(function(err, allPosts) {
        if (err) return next(err);
        var groupedPosts = {};
        _.each(allPosts, function(post) {
          groupedPosts[post.sourceData.source] = groupedPosts[post.sourceData.source] || [];
          groupedPosts[post.sourceData.source].push(post);
        });
        res.json({
          posts: groupedPosts
        });
      }, true);
    });
  });

};