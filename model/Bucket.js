var Util = require('./Util');
var ref = require('./ref');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
/**
 * Bucket:
 *   owner: an ID of the owner user
 *   name: The name of the bucket
 *   visibility: An array of IDs of users who can view it. If the array is empty, it's public
 *   parent: The parent bucket of this bucket. Can have no parent.
 *   contributors: An array of user IDs of those who can post to this bucket. If empty, it's public.
 *     NOTE: The owner will not be in this list! They are inferred as a contributor.
 */
var schema = new Schema({
  owner: {type: ObjectId, ref: ref.user, required: true},
  name: {type: String, default: 'New Bucket'},
  visibility: [{type: ObjectId, ref: ref.user}],
  parent: {type: ObjectId, ref: ref.bucket},
  contributors: [{type: ObjectId, ref: ref.user}]
});

schema.methods.addPost = function(post) {
  post.buckets.push(this.id);
};

schema.methods.getPosts = function(callback) {
  require('./Post').model.find({buckets: this.id}).sort('-created').exec(callback);
};

Util.addTimestamps(schema);

module.exports = {
  schema: schema,
  model: mongoose.model(ref.bucket, schema)
}