var Util = require('./Util');
var Image = require('./Image').schema;
var ref = require('./ref');

var _ = require('lodash-node');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Email = mongoose.SchemaTypes.Email;

var passportLocalMongoose = require('passport-local-mongoose');


/**
 * User:
 *   profilePicture: An array of profile pictures of the user where the last one is the current profile picture.
 *   lastLoginDate: The date the user last logged in.
 */
var schema = new Schema({
  phone: String,
  email: Email,
  name: {
    first: String,
    last: String
  },
  profilePicture: [Image],
  lastLoginDate: {type: Date, default: Date.now},
  connectedAccounts: [
    {
      provider: String,
      accessToken: String,
      refreshToken: String
    }
  ]
});

Util.addTimestamps(schema);

schema.plugin(passportLocalMongoose);

/*
 * Third-party account methods
 */
schema.methods.connect = function(provider, accessToken, refreshToken, profile, callback) {
  var connectedAccount = _.find(this.connectedAccounts, {provider: provider});
  if (connectedAccount) {
    connectedAccount.provider = provider;
    connectedAccount.accessToken = accessToken;
    connectedAccount.refreshToken = refreshToken;
  } else {
    this.connectedAccounts.push({
      provider: provider,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  }
  console.log();
  console.log(provider);
  console.log(arguments);
  console.log();

  if (callback) this.save(callback);
}

/*
 * Bucket methods
 */
schema.methods.createBucket = function(bucket, callback) {
  bucket.owner = this.id;
  if (callback) bucket.save(callback);
};

schema.methods.addBucketAsContributor = function(bucket, callback) {
  bucket.contributors.push(this.id);
  if (callback) bucket.save(callback);
};

schema.methods.getOwnedBuckets = function(callback) {
  require('./Bucket').model.find({owner: this.id}).sort('-created').exec(callback);
};

schema.methods.getContributingBuckets = function(callback) {
  require('./Bucket').model.find({$or: [ {owner: this.id}, {contributors: this.id} ] }).sort('-created').exec(callback);
};

schema.methods.getNonOwnedContributingBuckets = function(callback) {
  require('./Bucket').model.find({contributors: this.id}).sort('-created').exec(callback);
};

/*
 * Stream methods
 */
schema.methods.addStream = function(stream, callback) {
  stream.owner = this.id;
  if (callback) stream.save(callback);
};

schema.methods.getStreams = function(callback) {
  require('./Stream').model.find({owner: this.id}).sort('-created').exec(callback);
}

/*
 * Post methods
 */
schema.methods.makePost = function(post, callback) {
  post.author = this.id;
  if (callback) post.save(callback);
};

schema.methods.getPosts = function(callback) {
  require('./Post').model.find({author: this.id}).sort('-created').exec(callback);
};

module.exports = {
  schema: schema,
  model: mongoose.model(ref.user, schema)
};