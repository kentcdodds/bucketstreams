var Util = require('./Util');
var Image = require('./Image').schema;
var ref = require('./ref');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * Post:
 *   author: the ID of the user who created it
 *   content: an array that holds all the edits. The last one is the most recent edit.
 *   buckets: Array of buckets in which the post is contained
 */
var schema = new Schema({
  author: {type: ObjectId, ref: ref.user, required: true},
  content: [
    {
      textString: {type: String},
      multimedia: {
        images: [Image]
      }
    }
  ],
  sourceData: {
    source: String,
    id: {type: String, unique: true},
    createdAt: Date,
    metadata: {}
  },
  buckets: [{type: ObjectId, ref: ref.bucket, required: true}]
});

Util.addTimestamps(schema);

module.exports = {
  schema: schema,
  model: mongoose.model(ref.post, schema)
};