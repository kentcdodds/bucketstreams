var Util = require('./Util');
var ref = require('./ref');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * Post:
 *   author: the ID of the user who created it
 *   buckets: Array of buckets in which the post is contained
 */
var schema = new Schema({
  author: {type: ObjectId, ref: ref.user, required: true},
  sourcePost: {type: ObjectId, ref: ref.post, required: true},
  comments: String,
  buckets: [{type: ObjectId, ref: ref.bucket, required: true}]
});

Util.addTimestamps(schema);

module.exports = {
  schema: schema,
  model: mongoose.model(ref.share, schema)
};