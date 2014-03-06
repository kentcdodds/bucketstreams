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

schema.static.getPostsById = function(id, callback) {
  this.model(this.constructor.modelName).findOne({_id: id}, function(err, stream) {
    if (err) return callback(err);
    if (!stream) return callback('No stream with the id of ' + id);
    stream.getPosts(callback);
  });
};

schema.methods.getPosts = function(callback, streamsRetrieved, bucketsRetrieved) {
  var self = this;
  streamsRetrieved = streamsRetrieved || [self.id];
  bucketsRetrieved = bucketsRetrieved || [];

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
            _id: {
              $ne: self._id
            }
          }
        ]}, function(err, streams) {
        if (err) return done(err);
        async.concat(streams || [], function(stream, done) {
          function getSubscribedBucketsPosts(done) {
            if (stream.subscriptions.buckets && stream.subscriptions.buckets.length) {
              Post.find({ buckets : { $in : [ stream.subscriptions.buckets ] }}, done);
            } else {
              done();
            }
          }

          function getStreamPosts(done) {
            if (stream.subscriptions.streams && stream.subscriptions.streams.length) {
              var streamIds = self.subscriptions.streams;
              if (_.isEmpty(streamIds)) {
                streamIds.push(self._id);
              }
              self.model(self.constructor.modelName).find({_id: { $in: [ streamIds ] } }, function(err, streams) {
                if (err) return callback(err);
                async.concat(streams || [], function(stream, done) {
                  if (_.contains(streamsRetrieved, stream.id)) {
                    return done();
                  }
                  streamsRetrieved.push(stream.id);
                  stream.getPosts(done, streamsRetrieved, bucketsRetrieved);
                }, done);
              });
            } else {
              done();
            }
          }
          async.parallel([getSubscribedBucketsPosts, getStreamPosts], done);
        }, done);
      });
    }
    async.parallel([getUsersPosts, getAllStreamSubscriptionPosts], function(err, results) {
      if (err) return callback(err);
      var allPosts = _.chain(results)
        .unique('_id')
        .compact()
        .flatten()
        .value();
      callback(null, allPosts);
    });
  } else {
    self.getBucketSubscriptions(function(err, buckets) {
      if (err) return callback(err);
      async.concat(buckets || [], function(bucket, done) {
        if (_.contains(bucketsRetrieved, bucket._id)) return done();
        bucketsRetrieved.push(bucket.id);
        bucket.getPosts(done);
      }, function(err, bucketPosts) {
        if (err) return callback(err);
        var streamIds = self.subscriptions.streams;
        if (_.isEmpty(streamIds)) {
          streamIds.push(self._id);
        }
        self.model(self.constructor.modelName).find({_id: { $in: [ streamIds ] } }, function(err, streams) {
          if (err) return callback(err);
          async.concat(streams || [], function(stream, done) {
            if (_.contains(streamsRetrieved, stream.id)) return done();
            streamsRetrieved.push(stream.id);
            stream.getPosts(done, streamsRetrieved, bucketsRetrieved);
          }, function(err, streamPosts) {
            if (err) return callback(err);
            var allPosts = _.union(streamPosts, bucketPosts);
              _.chain(allPosts)
              .unique('_id')
              .compact()
              .flatten()
              .value();
            callback(null, allPosts);
          });
        });
      });
    });
  }
};


schema.path('name').validate(function (value, callback) {
  if (this.isNew) {
    Util.fieldIsUnique(this.model(this.constructor.modelName), 'name', value, {
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