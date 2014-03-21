var _ = require('lodash-node');

module.exports = {
  addTimestamps: function(schema) {
    schema.add({
      created: Date,
      modified: Date
    });
    schema.pre('save', function (next) {
      this.created = this.created || new Date();
      this.modified = new Date();
      next();
    });
  },
  fieldIsUnique: function(id, model, field, value, query, callback) {
    if (!_.isEmpty(value)) {
      var escapedValue = value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      var unique = {};
      unique[field] = new RegExp('^' + escapedValue + '$', 'i');
      if (query) {
        unique = {
          $and: [
            query,
            unique
          ]
        };
      }
      model.find(unique, '_id', function(err, results) {
        if (err) return callback(false);
        if (results.length === 0) {
          callback(true);
        } else if (results.length === 1) {
          callback(id === results[0])
        } else {
          callback(false);
        }
      });
    } else {
      callback(true);
    }
  }
};
