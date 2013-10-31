var mongoose = require('mongoose');
var mongooseTypes = require("mongoose-types");
mongooseTypes.loadTypes(mongoose);

var Schema = mongoose.Schema;

// shortcuts
var ObjectId = Schema.Types.ObjectId;
var Email = mongoose.SchemaTypes.Email;
var Url = mongoose.SchemaTypes.Url;

var ref = {
  bucket: 'bucket',
  stream: 'stream',
  user: 'user',
  post: 'post',
  comment: 'comment'
};

var schemas = {};

/**
 * Bucket:
 *   owner: an ID of the owner user
 *   name: The name of the bucket
 *   visibility: An array of IDs of users who can view it. If the array is empty, it's public
 *   parent: The parent bucket of this bucket. Can have no parent.
 *   contributors: An array of user IDs of those who can post to this bucket. If empty, it's public
 */
schemas.bucket = new Schema({
  owner: {type: ObjectId, ref: ref.user, required: true},
  name: {type: String, default: 'New Bucket'},
  visibility: [{type: ObjectId, ref: ref.user}],
  parent: {type: ObjectId, ref: ref.bucket},
  contributors: [{type: ObjectId, ref: ref.user}]
});

/**
 * Stream:
 *   owner: an ID of the owner user
 *   name: The name of the stream
 *   visibility: An array of IDs of users who can view it. If the array is empty, it's public
 *   contentSources:
 *     buckets: An array of bucket IDs which feed into this stream
 *     streams: An array of stream IDs which feed into this stream
 */
schemas.stream = new Schema({
  owner: {type: ObjectId, ref: ref.user, required: true},
  name: {type: String, default: 'New Stream'},
  visibility: [{type: ObjectId, ref: ref.user}],
  contentSources: {
    buckets: [{type: ObjectId, ref: ref.bucket}],
    streams: [{type: ObjectId, ref: ref.stream}]
  }
});

/**
 * User:
 *   name: The name of the user.
 *   handle: The "unique" identifier of the user by which they are referenced in the application.
 *   lastLoginDate: The date the user last logged in.
 *   connectedAccounts: array of connected accounts with information to pull data for user.
 */
schemas.user = new Schema({
  name: {type: String, required: true},
  handle: {type: String, unique: true, required: true},
  profilePicture: {
    id: ObjectId,
    url: Url
  },
  email: {type: Email},
  lastLoginDate: {type: Date, default: Date.now},
  connectedAccounts: [
    {
      platform: {type: String, default: ''},
      token: {type: String, default: ''},
      expirationDate: Date
    }
  ]
});

/**
 * Post:
 *   authorId: the ID of the user who created it
 *   content: the content of the post as a String
 *   comments: Array of comments IDs
 *   buckets: Array of buckets in which the post is contained
 */
schemas.post = new Schema({
  authorId: {type: ObjectId, ref: ref.user, required: true},
  content: {type: String, default: '', required: true},
  comments: [{type: ObjectId, ref: ref.comment}],
  buckets: [{type: ObjectId, ref: ref.bucket}],
});

/**
 * Comment:
 *   authorId: the ID of the user who created it
 *   content: the content of the comment as a String
 */
schemas.comment = new Schema({
  authorId: {type: ObjectId, ref: ref.user},
  content: {type: String, default: ''}
});

var models = {};

for (var schema in schemas) {
  schemas[schema].plugin(mongooseTypes.useTimestamps);
  models[schema] = mongoose.model(ref[schema], schemas[schema]);

  schemas[schema].methods.query = function(entities) {
    console.log('Queried ' + schema + ':');
    console.log(entities);
  };

  schemas[schema].methods.get = function(entity) {
    console.log('Got ' + schema + ':');
    console.log(entity);
  };

  schemas[schema].methods.put = function(entity) {
    console.log('Put ' + schema + ':');
    console.log(entity);
  };

  schemas[schema].methods.post = function(entity) {
    console.log('Posted ' + schema + ':');
    console.log(entity);
  };

  schemas[schema].methods.delete = function(entity) {
    console.log('Delete ' + schema + ':');
    console.log(entity);
  };
}

module.exports = {
  models: models,
  schemas: schemas
};