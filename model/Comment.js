var Util = require('./Util');
var Content = require('./Content').schema;
var ref = require('./ref');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * Comment:
 *   authorId: the ID of the user who created it
 *   content: an array that holds all the edits. The last one is the most recent edit.
 *   post: The post on which the comment is found
 */
var schema = new Schema({
  authorId: {type: ObjectId, ref: ref.user},
  content: [Content],
  owningPost: {type: ObjectId, ref: ref.post}
});

Util.addAngularBridgeFunctions(schema);
Util.addTimestamps(schema);

module.exports = {
  schema: schema,
  model: mongoose.model(ref.comment, schema)
}