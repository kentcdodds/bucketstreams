var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var User = mongoose.model('User', new Schema({
  name: String,
  handle: String,
  buckets: [
    {
      name: String,
      visibility: [
        String
      ],
      parent: Schema.Types.ObjectId,
      contributors: Schema.Types.Mixed
    }
  ],
  streams: [
    {
      contentSources: {
        bucketIds: [Schema.Types.ObjectId],
        streamIds: [Schema.Types.ObjectId]
      }
    }
  ],
  registrationDate: { type: Date, default: Date.now }
}));

var Post = mongoose.model('Post', new Schema({
  authorId: Schema.Types.ObjectId,
  content: String,
  comments: [
    {
      userId: Schema.Types.ObjectId,
      content: String
    }
  ],
  bucketIds: [Schema.Types.ObjectId],
  postDate: { type: Date, default: Date.now }
}));

module.exports = {
  User: User,
  Post: Post
};
