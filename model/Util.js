var mongooseTypes = require("mongoose-types");

exports.addAngularBridgeFunctions = function(schema) {
  schema.methods.query = function(entities) {
    console.log('Queried ' + schema.name + ':');
    console.log(entities);
  };

  schema.methods.get = function(entity) {
    console.log('Got ' + schema.name + ':');
    console.log(entity);
  };

  schema.methods.put = function(entity) {
    console.log('Put ' + schema.name + ':');
    console.log(entity);
  };

  schema.methods.post = function(entity) {
    console.log('Posted ' + schema.name + ':');
    console.log(entity);
  };

  schema.methods.delete = function(entity) {
    console.log('Delete ' + schema.name + ':');
    console.log(entity);
  };
}

exports.addTimestamps = function(schema) {
  schema.plugin(mongooseTypes.useTimestamps);
}