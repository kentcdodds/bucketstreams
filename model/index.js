var ref = require('./ref');

var mongoose = require('mongoose');

var mongooseTypes = require('mongoose-types'); // For Email and Url types.
mongooseTypes.loadTypes(mongoose);

// Non-model (Embedded)
var Image = require('./Image');
var Content = require('./Content');

// Model
var Bucket = require('./Bucket');
var Stream = require('./Stream');
var User = require('./User');
var Post = require('./Post');
var Comment = require('./Comment');

function getAllProps(property) {
  var allProps = {};
  allProps[ref.bucket] = Bucket[property];
  allProps[ref.stream] = Stream[property];
  allProps[ref.user] = User[property];
  allProps[ref.post] = Post[property];
  allProps[ref.comment] = Comment[property];
  return allProps;
}

module.exports = {
  models: getAllProps('model'),
  schemas: getAllProps('schema')
}