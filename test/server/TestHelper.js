var models = require('../../model').models;
var _ = require('lodash-node');

var data = {};

data.db = {
  uri: process.env.MONGO_CONNECTION_STRING + '_test'
};

data.mock = {};

data.mock.getTestDefaults = {
  user: function(options) {
    return _.extend({
      name: 'Test User 1',
      handle: 'testuser1' + Math.floor(Math.random()*100001)
    }, options);
  },
  bucket: function(options) {
    var mockUserId = data.mock.getModel('user').id;
    return _.extend({
      owner: mockUserId,
      name: 'Test Bucket ' + Math.floor(Math.random()*100001),
      visibility: [],
      contributors: [mockUserId]
    }, options);
  },
  stream: function(options) {
    var mockUserId = data.mock.getModel('user').id;
    return _.extend({
      owner: mockUserId,
      name: 'Test Stream',
      visibility: [mockUserId],
        subscriptions: {
        buckets: [],
          streams: []
      }
    }, options);
  },
  post: function(options) {
    return _.extend({
      author: data.mock.getModel('user').id,
      content: [{
        textString: 'This is the latest content with multimedia',
        multimedia: {
          images: [data.mock.getTestDefaults.image()]
        }
      }],
      buckets: [data.mock.getModel('bucket').id, data.mock.getModel('bucket').id]
    }, options);
  },
  image: function(options) {
    return _.extend({
      name: 'GoogleLogo.png',
      url: 'https://www.google.com/images/srpr/logo11w.png'
    }, options);
  },
  rule: function(options) {
    var mockBucketId = data.mock.getModel('bucket').id;
    return _.extend({
      type: 'inbound',
      constraints: {
        hashtags: {
          any: [ 'any' ],
          all: [ 'all' ],
          none: [ 'none' ]
        },
        buckets: {
          any: [  ],
          all: [ mockBucketId ],
          none: [  ]
        }
      }
    }, options);
  }
};

data.mock.getModel = function(type, number, options) {
  var theModels = [];
  if (_.isObject(number) || _.isUndefined(number)) {
    options = number;
    number = 1;
  }
  options = data.mock.getTestDefaults[type](options);
  for (var i = 0; i < number; i++) {
    theModels.push(new models[type](options));
  }

  if (number === 1) {
    return theModels[0];
  } else {
    return theModels;
  }
};

data.mock.createInstance = function(type, number, options, callback) {
  // Overloaded!!!
  if (_.isFunction(number)) {
    callback = number;
    options = undefined;
    number = 1;
  } else if (_.isObject(number)) {
    callback = options;
    options = number;
    number = 1;
  } else if (_.isFunction(options)) {
    callback = options;
    options = undefined;
  }

  var items = [];
  for (var i = 0; i < number; i++) {
    items.push(data.mock.getTestDefaults[type](options));
  }
  return models[type].create(items, callback);
};

module.exports = {
  data: data
};