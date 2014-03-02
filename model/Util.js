var troop = require('mongoose-troop');

exports.addTimestamps = function(schema) {
  schema.plugin(troop.timestamp);
};