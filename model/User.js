var Util = require('./Util');
var Image = require('./Image').schema;
var ref = require('./ref');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Email = mongoose.SchemaTypes.Email;
var passportLocalMongoose = require('passport-local-mongoose');

/**
 * User:
 *   name: The name of the user.
 *   handle: The "unique" identifier of the user by which they are referenced in the application.
 *   profilePicture: An array of profile pictures of the user where the last one is the current profile picture.
 *   email: The email address of the user.
 *   phone: The phone number of the user.
 *   lastLoginDate: The date the user last logged in.
 *   connectedAccounts: array of connected accounts with information to pull/push data for user.
 */
var schema = new Schema({
  name: {type: String, required: true},
  handle: {type: String, unique: true, required: true},
  profilePicture: [Image],
  email: {type: Email},
  phone: {type: String},
  lastLoginDate: {type: Date, default: Date.now},
  connectedAccounts: [
    {
      platform: {type: String, default: ''},
      token: {type: String, default: ''},
      expirationDate: Date
    }
  ]
});

Util.addTimestamps(schema);
schema.plugin(passportLocalMongoose);

schema.methods.addBucketAsOwner = function(bucket) {
  bucket.owner = this.id;
};

schema.methods.addBucketAsContributor = function(bucket) {
  bucket.contributors.push(this.id);
};

schema.methods.getOwnedBuckets = function(callback) {
  require('./Bucket').model.find({owner: this.id}).sort('-created').exec(callback);
};

schema.methods.getContributingBuckets = function(callback) {
  require('./Bucket').model.find({$or: [ {owner: this.id}, {contributors: this.id} ] }).sort('-created').exec(callback);
};

module.exports = {
  schema: schema,
  model: mongoose.model(ref.user, schema)
}