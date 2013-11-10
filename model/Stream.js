var Util = require('./Util');
var ref = require('./ref');

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
  }
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

module.exports = {
  schema: schema,
  model: mongoose.model(ref.stream, schema)
}