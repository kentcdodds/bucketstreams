var Util = require('./Util');
var Content = require('./Content').schema;
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
  content: [Content],
  sourceData: {},
  buckets: [{type: ObjectId, ref: ref.bucket, required: true}]
});

Util.addTimestamps(schema);

var setSourceFrom = {
  twitter: function(data) {
    return {
      source: 'twitter',
      id: data['id_str']
    };
  }
};

schema.methods.importFromSource = function(source, data) {
  this.sourceData = setSourceFrom[source](data);
  this.markModified('sourceData');
};

schema.methods.createPostFromTwitter = function(user, data) {
  this.author = user.id;
  this.content = data.text;
  var rules = user.connectedAccounts.twitter.rules;
};

module.exports = {
  schema: schema,
  model: mongoose.model(ref.post, schema)
};