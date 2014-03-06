var Util = require('./Util');
var ref = require('./ref');
var Post = require('./Post').model;
var Comment = require('./Comment').model;
var User = require('./User').model;
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

schema.methods.addPost = function(post, callback) {
  post.buckets.push(this.id);
  if (callback) post.save(callback);
};

schema.methods.getPosts = function(callback) {
  Post.find({buckets: this.id}).sort('createdAt').exec(function(err, posts) {
    if (err) return callback(err);

    var postIds = _.pluck(posts, '_id');
    Comment.find({owningPost: {$in: postIds}}, function(err, comments) {
      if (err) return done(err);
      var commentAuthors = _.pluck(comments, 'author');
      var postAuthors = _.pluck(posts, 'author');
      User.find({_id: {$in: _.union(commentAuthors, postAuthors)}}, '_id username name profilePicture', function(err, users) {
        _.each(comments, function(comment) {
          comment._doc.authorInfo = _.find(users, {_id: comment.author});
        });
        _.each(posts, function(post) {
          post._doc.comments = _.where(comments, {owningPost: post._id});
          post._doc.authorInfo = _.find(users, {_id: post.author});
        });
        callback(null, posts);
      });
    });
  });
};

Util.addTimestamps(schema);


schema.path('name').validate(function (value, callback) {
  Util.fieldIsUnique(this.model(this.constructor.modelName), 'name', value, {
    'owner': this.owner
  }, callback);
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