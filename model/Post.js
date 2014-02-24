var Util = require('./Util');
var ref = require('./ref');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Url = mongoose.SchemaTypes.Url;
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
        images: [{
          name: {type: String, default: 'Untitled'},
          url: {type: Url, required: true}
        }]
      }
    }
  ],
  sourceData: {
    source: String,
    id: String,
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