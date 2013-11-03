var models = require('../../model').models;
var _ = require('lodash-node');

exports.db = {
  uri: process.env.MONGO_CONNECTION_STRING + '_test'
}

exports.getMock = {
  user: function(options) {
    options = _.extend({
      name: 'Test User 1',
      handle: 'testuser1'
    }, options);
    return new models.user(options);
  },
  bucket: function(options) {
    var mockUserId = this.user().id;
    options = _.extend({
      owner: mockUserId,
      name: 'Test Bucket',
      visibility: [],
      contributors: [mockUserId]
    }, options);
    return new models.bucket(options);
  },
  post: function(options) {
    options = _.extend({
      authorId: this.user().id,
      content: [this.content()],
      buckets: [this.bucket().id, this.bucket().id]
    }, options);
    return new models.post(options);
  },
  image: function() {
    return {
      name: 'GoogleLogo.png',
      url: 'https://www.google.com/images/srpr/logo11w.png'
    };
  },
  content: function() {
    return {
      textString: 'This is the latest content with multimedia',
      multimedia: {
        images: [this.image()]
      }
    };
  }
}