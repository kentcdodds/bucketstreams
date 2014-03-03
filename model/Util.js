exports.addTimestamps = function(schema) {
  schema.add({
    created: Date,
    modified: Date
  });
  schema.pre('save', function (next) {
    if (this.isNew) {
      this.created = new Date;
    }
    this.modified = new Date;
    next();
  });
};