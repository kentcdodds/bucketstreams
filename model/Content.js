var Image = require('./Image').schema;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Content:
 *   textString: The text content
 *   multimedia: Any multimedia associated with the content
 *     images: An array of images associated with the content
 */
var schema = new Schema({
  textString: {type: String},
  multimedia: {
    images: [Image]
  }
});

module.exports = {
  schema: schema
  // Intentionally no model.
  // This is meant to be embedded.
}