var Util = require('./Util');
var ref = require('./ref');
var Post = require('./Post').model;
var _ = require('lodash-node');
var async = require('async');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
/**
 * Bucket:
 *   owner: an ID of the owner user
 *   name: The name of the bucket
 *   description: The description of the bucket
 *   visibility: An array of IDs of users who can view it. If the array is empty, it's public
 *   parent: The parent bucket of this bucket. Can have no parent.
 *   contributors: An array of user IDs of those who can post to this bucket. If empty, it's public.
 */
var schema = new Schema({
  owner: {type: ObjectId, ref: ref.user, required: true},
  name: {type: String, default: 'New Bucket', required: true},
  description: {type: String, required: false},
  visibility: [{type: ObjectId, ref: ref.user}],
  parent: {type: ObjectId, ref: ref.bucket},
  contributors: [{type: ObjectId, ref: ref.user}],
  isMain: {type: Boolean, required: false}
});

Util.addTimestamps(schema);

schema.methods.addPost = function(post, callback) {
  post.buckets.push(this.id);
  if (callback) post.save(callback);
};

schema.methods.getPostsAndShares = function(options, callback) {
  if (!callback) {
    callback = options;
    options = {
      limit: 20,
      skip: 0
    }
  }
  var query = {buckets: this._id };
  if (this.isMain) {
    query = {
      author: this.owner
    }
  }
  require('./QueryUtil').getPostsAndShares(query, options, function(err, result) {
    if (err) return callback(err);
    callback(null, {
      posts: result.posts,
      shares: result.shares,
      sharePosts: result.sharePosts
    });
  });
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
    next(new Error('Cannot change main bucket'));
  } else {
    next();
  }
});

module.exports = {
  schema: schema,
  model: mongoose.model(ref.bucket, schema)
};