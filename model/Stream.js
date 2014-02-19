var Util = require('./Util');
var ref = require('./ref');

var Post = require('./Post').model;
var User = require('./User').model;
var Comment = require('./Comment').model;
var Bucket = require('./Bucket').model;

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
 *   contentSources:
 *     buckets: An array of bucket IDs which feed into this stream
 *     streams: An array of stream IDs which feed into this stream
 */
var schema = new Schema({
  owner: {type: ObjectId, ref: ref.user, required: true},
  name: {type: String, default: 'New Stream'},
  visibility: [{type: ObjectId, ref: ref.user}],
  subscriptions: {
    buckets: [{type: ObjectId, ref: ref.bucket}],
    streams: [{type: ObjectId, ref: ref.stream}]
  },
  isMain: {type: Boolean, required: false}
});

Util.addTimestamps(schema);

schema.methods.subscribeToBucket = function(bucket, callback) {
  this.subscriptions.buckets.push(bucket.id);
  if (callback) this.save(callback);
};

schema.methods.getBucketSubscriptions = function(callback) {
  this.model(this.constructor.modelName).findById(this).populate('subscriptions.buckets').exec(function(err, populated) {
    populated = populated || {subscriptions: { buckets: [] }};
    callback(err, populated.subscriptions.buckets);
  });
};

schema.static.getStreamsByUserId = function(userId, callback) {
  this.model(this.constructor.modelName).find({owner: userId}, callback);
};

schema.methods.getPosts = function(callback) {
  var allPosts = [];
  var self = this;
  function addAllPosts(err, buckets) {
    if (err) return callback(err);
    async.each(buckets || [], function(bucket, done) {
      bucket.getPosts(function(err, posts) {
        if (err) return done(err);
        allPosts = _.union(allPosts, posts);
        done();
      });
    }, function(err) {
      callback(err, allPosts);
    });
  }

  if (self.isMain) {


    function getUsersPosts(done) {
      Post.find({
        author: self.owner
      }, done);
    }

    function getAllStreamSubscriptionPosts(done) {
      self.model(self.constructor.modelName).find({
        $and: [
          {
            owner: self.owner
          },
          {
            $not: {
              _id: self.id
            }
          }
        ]}, 'subscriptions', function(err, streamSubscriptions) {
        if (err) return done(err);
        async.concat(streamSubscriptions || [], function(subscriptions, done) {
          function getSubscribedBucketsPosts(done) {
            if (subscriptions.buckets && subscriptions.buckets.length) {
              Post.find({ buckets : { $in : [ subscriptions.buckets ] }}, done);
            } else {
              done();
            }
          }

          function getStreamPosts(done) {
            if (subscriptions.streams && subscriptions.streams.length) {
              async.parallel(subscriptions.streams || [], function(stream, streamDone) {
                stream.getPosts(streamDone);
              }, done);
            } else {
              done();
            }
          }
          async.parallel([getSubscribedBucketsPosts, getStreamPosts], done);
        }, done);
      });
    }
    async.parallel([getUsersPosts, getAllStreamSubscriptionPosts], function(err, posts) {
      if (err) return callback(err);
      posts = _(posts).flatten().unique().value();
      Comment.find({owningPost: {$in: _.pluck(posts, '_id')}}, function(err, comments) {
        _.each(posts, function(post) {
          post.comments = _.find(comments, {owningPost: post._id});
        });
        callback(null, posts);
      });
    });
  } else {
    self.getBucketSubscriptions(addAllPosts);
  }
};

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