var Util = require('./Util');
var Image = require('./Image');
var Rule = require('./Rule');
var Post = require('./Post').model;
var ref = require('./ref');
var async = require('async');
var logger = require('winston');

var providers = require('../controller/providers');

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
  profilePicture: [Image.schema],
  lastLoginDate: {type: Date, default: Date.now},
  rules: [Rule.schema],
  connectedAccounts: {
    facebook: {
      accountId: String,
      token: String,
      rules: [Rule.schema]
    },
    twitter: {
      accountId: String,
      token: String,
      secret: String,
      lastImportedTweetId: Number,
      rules: [Rule.schema]
    },
    google: {
      accountId: String,
      token: String,
      secret: String,
      rules: [Rule.schema]
    }
  }
});

Util.addTimestamps(schema);

schema.plugin(passportLocalMongoose);

/*
 * Third-party account methods
 */
schema.methods.connect = function(provider, token, secret, profile, callback) {
  this.connectedAccounts[provider] = this.connectedAccounts[provider] || {};
  this.connectedAccounts[provider].token = token;
  this.connectedAccounts[provider].secret = secret;
  this.connectedAccounts[provider].accountId = profile.id;
  if (callback) this.save(callback);
};

schema.methods.isConnected = function(provider) {
  return !!this.connectedAccounts[provider];
};

/*
 * Rule methods
 */
var getPostContent = {
  twitter: function(data) {
    return data.text;
  },
  facebook: function(data) {
    return 'Facebook is not supported...';
  },
  google: function(data) {
    return 'Google is not supported...';
  }
};

var createPost = {
  twitter: function(user, data, content) {
    if (!user.connectedAccounts.twitter.lastImportedTweetId || data.id > user.connectedAccounts.twitter.lastImportedTweetId) {
      user.connectedAccounts.twitter.lastImportedTweetId = data.id;
    }
    return new Post({
      author: user.id,
      content: [
        {
          textString: content
        }
      ],
      sourceData: {
        tweetId: data.id,
        createdAt: data['created_at']
      }
    });
  },
  facebook: function(user, data, content) {

  },
  google: function(user, data, content) {

  }
};

var hashtagRegex = /\S*#(?:\[[^\]]+\]|\S+)/gi;

function getBucketsToPostTo(postContent, rules) {
  var bucketIds = [];
  _.each(rules, function(rule) {
    if (rule.type !== 'inbound') {
      return;
    }
    var hashtags = postContent.match(hashtagRegex) || [];
    var ruleTags = rule.constraints.hashtags;
    var containsAny = !ruleTags.any || ruleTags.any.length === 0; // true if this is empty
    var containsAll = true;
    var containsNone = false;

    for (var i = 0; i < hashtags.length; i++) {
      var hashtag = hashtags[i].substring(1);
      if (ruleTags.none.length && _.contains(ruleTags.none, hashtag)) {
        containsNone = true;
        return;
      }
      if (ruleTags.any.length && _.contains(ruleTags.any, hashtag)) {
        containsAny = true;
      }
      if (ruleTags.all.length && !_.contains(ruleTags.all, hashtag)) {
        containsAll = false;
        return;
      }
    }
    if (containsAll && containsAny && !containsNone) {
      bucketIds = bucketIds.concat(rule.constraints.buckets.all);
    }
  });
  return bucketIds;
}

schema.methods.importPosts = function(callback) {
  var allPosts = [];
  var self = this;
  var theProviders = [
    {
      name: 'facebook',
      finishedImporting: false
    },
    {
      name: 'twitter',
      finishedImporting: false
    },
    {
      name: 'google',
      finishedImporting: false
    }
  ];
  _.each(theProviders, function(theProvider) {
    providers[theProvider.name].getPosts(self, function(postDataArray) {
      for (var i = 0; i < postDataArray.length; i++) {
        var postData = postDataArray[i];
        var content = getPostContent[theProvider.name](postData);
        var bucketsToPostTo = getBucketsToPostTo(content, self.connectedAccounts[theProvider.name].rules);

        if (bucketsToPostTo.length) {
          var post = createPost[theProvider.name](self, postData, content);
          post.buckets = (post.buckets || []).concat(bucketsToPostTo);
          allPosts.push(post);
        }
      }
      theProvider.finishedImporting = true;
      maybeSaveAll();
    });
  });

  function maybeSaveAll() {
    if (!_.every(theProviders, 'finishedImporting')) {
      return;
    }
    var errors = [];
    async.every(allPosts, function(post, saveCallback) {
      post.save(function(err) {
        if (err) errors.push(err);

        saveCallback(!err);
      });
    }, function(result) {
      if (result) {
        self.save(callback);
      } else {
        callback(new Error('Problem saving posts.' + JSON.stringify(errors)));
      }
    });
  }
};
/*
 * Bucket methods
 */
schema.methods.ownBucket = function(bucket, callback) {
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