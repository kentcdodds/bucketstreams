var Util = require('./Util');
var ref = require('./ref');

var Post = require('./Post').model;
var Share = require('./Share').model;
var User = require('./User').model;
var Comment = require('./Comment').model;
var Bucket = require('./Bucket').model;

var Q = require('q');
var _ = require('lodash-node');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * Stream:
 *   owner: an ID of the owner user
 *   name: The name of the stream
 *   visibility: An array of IDs of users who can view it. If the array is empty, it's public
 *   subscriptions:
 *     buckets: An array of bucket IDs which feed into this stream
 *     streams: An array of stream IDs which feed into this stream
 */
var schema = new Schema({
  owner: {type: ObjectId, ref: ref.user, required: true},
  name: {type: String, default: 'New Stream', required: true},
  description: {type: String, required: false},
  visibility: [{type: ObjectId, ref: ref.user}],
  subscriptions: {
    buckets: [{type: ObjectId, ref: ref.bucket}],
    streams: [{type: ObjectId, ref: ref.stream}]
  },
  isMain: {type: Boolean, required: false}
});

Util.addTimestamps(schema);

schema.methods.getBucketSubscriptions = function(callback) {
  this.model(this.constructor.modelName).findById(this).populate('subscriptions.buckets').exec(function(err, populated) {
    populated = populated || {subscriptions: { buckets: [] }};
    callback(err, populated.subscriptions.buckets);
  });
};

schema.methods.resolveSubscriptions = function(callback) {
  var allBucketIds = [];
  var resolvedStreams = [];
  var Stream = this.model(this.constructor.modelName);
  
  function resolveSubscriptions(callback) {
    if (_.contains(resolvedStreams, this)) return callback();
    
    resolvedStreams = _.union(resolvedStreams, this.id);
    if (this.hasBucketSubscriptions()) {
      allBucketIds = _.union(allBucketIds, this.subscriptions.buckets);
    }
    
    if (!this.hasStreamSubscriptions()) return callback();
    var streamIds = _.flatten(this.subscriptions.streams);
    Stream.find({'_id': {$in: streamIds}}, '_id subscriptions', function(err, streams) {
      if (err) return callback(err);
      async.each(streams, function(stream, done) {
        _.bind(resolveSubscriptions, stream, done)();
      }, function(err) {
        callback(err);
      });
    });
  }
  
  _.bind(resolveSubscriptions, this, function(err) {
    if (err) return callback(err);
    callback(null, allBucketIds);
  })();
};

schema.methods.hasBucketSubscriptions = function() {
  return this.subscriptions.buckets.length > 0;
};
schema.methods.hasStreamSubscriptions = function() {
  return this.subscriptions.streams.length > 0;
};

schema.static.getStreamsByUserId = function(userId, callback) {
  this.model(this.constructor.modelName).find({owner: userId}, callback);
};

schema.static.getPostsAndSharesById = function(id, callback) {
  this.model(this.constructor.modelName).findOne({_id: id}, function(err, stream) {
    if (err) return callback(err);
    if (!stream) return callback('No stream with the id of ' + id);
    stream.getPostsAndShares(callback);
  });
};

schema.methods.getPostsAndShares = function(callback) {
  var self = this;
  var Stream = this.model(this.constructor.modelName);

  function uniqueById(allIds, objIds) {
    var union = _.union(allIds, objIds);
    return _.unique(union, function(objId) {
      return objId.id;
    });
  }

  // get all posts
  function getPostsAndShares(responseBuilder) {
    if (_.isEmpty(responseBuilder.bucketIds)) {
      return responseBuilder;
    }
    var deferred = Q.defer();
    var query = {buckets: { $in: responseBuilder.bucketIds }};
    require('./QueryUtil').getPostsAndShares(query, function(err, result) {
      if (err) return deferred.reject(err);
      responseBuilder.posts = uniqueById(responseBuilder.posts, result.posts);
      responseBuilder.shares = uniqueById(responseBuilder.shares, result.shares);
      responseBuilder.sharePosts = uniqueById(responseBuilder.sharePosts, result.sharePosts);
      deferred.resolve(responseBuilder);
    });
    return deferred.promise;
  }
  
  // resolve ids of all user's stream's subscriptions
  function getSubscribedBucketIds(responseBuilder) {
    var deferred = Q.defer();
    this.resolveSubscriptions(function(err, bucketIds) {
      if (err) return deferred.reject(err);
      responseBuilder.bucketIds = uniqueById(responseBuilder.bucketIds, bucketIds);
      deferred.resolve(responseBuilder);
    });
    return deferred.promise;
  }

  // return result object
  function returnResult(responseBuilder) {
    callback(null, {
      posts: responseBuilder.posts,
      shares: responseBuilder.shares,
      sharePosts: responseBuilder.sharePosts
    });
  }
  
  function fail(err) {
    callback(err);
  }

  var responseBuilder = {
    posts: [],
    shares: [],
    resolvedStreams: [],
    bucketIds: []
  };
  var promise;

  if (self.isMain) {
    // get all of the user's posts
    function getUserPostsAndShares(responseBuilder) {
      var deferred = Q.defer();
      var query = { author: self.owner };
      require('./QueryUtil').getPostsAndShares(query, function(err, result) {
        if (err) return deferred.reject(err);
        responseBuilder.posts = uniqueById(responseBuilder.posts, result.posts);
        responseBuilder.shares = uniqueById(responseBuilder.shares, result.shares);
        responseBuilder.sharePosts = uniqueById(responseBuilder.sharePosts, result.sharePosts);
        deferred.resolve(responseBuilder);
      });
      return deferred.promise;
    }
    
    function getAllSubscribedBucketIds(responseBuilder) {
      var deferred = Q.defer();
      Stream.find({owner: self.owner}, '_id subscriptions', function(err, streams) {
        if (err) return deferred.reject(err);
        var iterators = [];
        _.each(streams, function(stream, index) {
          iterators[index] = function(done) {
            _.bind(getSubscribedBucketIds, stream, responseBuilder)().then(done);
          }
        });
        async.parallel(iterators, function(responseBuilder) {
//          if (err) return deferred.reject(err);
          deferred.resolve(responseBuilder);
        });
      });
      return deferred.promise;
    }
    
    promise = getUserPostsAndShares(responseBuilder).then(getAllSubscribedBucketIds);
  } else {
    // get bucket subscription ids
    promise = _.bind(getSubscribedBucketIds, self, responseBuilder)();
  }
  promise.then(getPostsAndShares).then(returnResult).fail(fail);
};


schema.path('name').validate(function (value, callback) {
  if (this.isNew) {
    Util.fieldIsUnique(this.id, this.model(this.constructor.modelName), 'name', value, {
      'owner': this.owner
    }, callback);
  } else {
    callback(true);
  }
}, 'nameNotUnique');

schema.pre('save', function (next) {
  if (!this.isNew && this.isMain) {
    next(new Error('Cannot change main stream'));
  } else {
    next();
  }
});

module.exports = {
  schema: schema,
  model: mongoose.model(ref.stream, schema)
};