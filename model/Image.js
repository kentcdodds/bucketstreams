var Util = require('./Util');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Url = mongoose.SchemaTypes.Url;

/**
 * Image:
 *   name: The filename of the image
 *   url: The url of the image hosted on a cdn
 */
var schema = new Schema({
  name: {type: String, default: 'Untitled'},
  url: {type: Url, required: true}
});

Util.addTimestamps(schema);

module.exports = {
  schema: schema
  // Intentionally no model.
  // This is meant to be embedded.
}