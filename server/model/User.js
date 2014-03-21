var Util = require('./Util');
var Post = require('./Post').model;
var ref = require('./ref');
var async = require('async');
var logger = require('winston');
var uuid = require('node-uuid');
var moment = require('moment');

var providers = require('../controller/providers');

var _ = require('lodash-node');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var passportLocalMongoose = require('passport-local-mongoose');

var minute = 1000 * 60;

var rule = {
  name: {type: String, default: 'Unnamed Rule'},
  ruleType: String,
  constraints: {
    hashtags: {
      any: [ String ],
      all: [ String ],
      none: [ String ]
    },
    buckets: {
      any: [{type: ObjectId, ref: ref.bucket}],
      all: [{type: ObjectId, ref: ref.bucket}],
      none: [{type: ObjectId, ref: ref.bucket}]
    }
  }
};
var connectedAccount = {
  accountId: String,
  token: String,
  lastImportEpoch: Number,
  timeBetweenImports: {type: Number, default: 5 * minute},
  rules: {
    outbound: [rule],
    inbound: [rule]
  }
};

/**
 * User:
 *   profilePicture: a url to the profile picture
 *   lastLoginDate: The date the user last logged in.
 */
var schema = new Schema({
  username: {type: String, required: false},
  phone: String,
  email: {type: String, unique: true, required: true},
  emailConfirmation: {
    secret: String,
    emailSent: Date,
    confirmed: {type: Boolean, default: false}
  },
  name: {
    first: String,
    last: String
  },
  profilePicture: String,
  lastLoginDate: {type: Date, default: Date.now},
  setupReminderDate: {type: Date, required: false},
  mainStream: {type: ObjectId, ref: ref.stream},
  mainBucket: {type: ObjectId, ref: ref.bucket},
  connectedAccounts: {
    facebook: connectedAccount,
    twitter: _.extend(connectedAccount, {
      secret: String,
      lastImportedTweetId: Number
    }),
    google: _.extend(connectedAccount, {
      secret: String
    })
  },
  dontRemind: [{type: String, required: false}],
  passwordReset: {
    emailSent: {type: Date, required: false},
    secret: {type: String, required: false},
    used: {type: Boolean, required: false}
  }
});

Util.addTimestamps(schema);

schema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameLowerCase: true
});

/*
 * Validation
 */
schema.path('username').validate(function (value) {
  return !!(value || '').match(/^([a-zA-Z]|_|\d)*$/);
}, 'invalid');

schema.path('username').validate(function (value) {
  var length = (value || '').length;
  return length <= 16;
}, 'tooLong');

schema.path('username').validate(function (value) {
  var length = (value || '').length;
  return length >= 3;
}, 'tooShort');

var reservedUsernames = [
  'microsoft',
  'google',
  'facebook',
  'twitter'
];

var appRouteUsernames = [
  'settings',
  'rules',
  'tos',
  'privacy',
  'third-party',
  'getting-started',
  'auth',
  'api',
  'new'
];

schema.path('username').validate(function (value) {
  return !_.contains(reservedUsernames, value);
}, 'reserved');

schema.path('username').validate(function (value) {
  return !_.contains(appRouteUsernames, value);
}, 'unavailable');

schema.path('username').validate(function (value, callback) {
  if (this.isNew) {
    Util.fieldIsUnique(this.id, this.model(ref.user), 'username', value, null, callback);
  } else {
    callback(true);
  }
}, 'taken');

schema.path('email').validate(function (value) {
  return /^[a-zA-Z0-9._-]+(\+[a-zA-Z0-9._-]+)?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
}, 'email invalid');

/*
 * Password reset methods
 */
schema.methods.setupPasswordReset = function(callback) {
  this.passwordReset = {
    emailSent: new Date(),
    secret: uuid.v4()
  };
  callback && this.save(callback);
};

schema.statics.findByPasswordResetSecret = function(secret, callback) {
  this.findOne({'passwordReset.secret': secret}, '_id name username email passwordReset', callback);
};

schema.statics.findByEmailConfirmationSecret = function(secret, callback) {
  this.findOne({'emailConfirmation.secret': secret}, '_id name username email emailConfirmation', callback);
};

/*
 * Convenience methods
 */
schema.statics.getUserByUsernameOrEmail = function(username, callback) {
  var query = {};
  if (username.indexOf('@') > -1) {
    query.email = username;
  } else {
    query.username = username;
  }
  this.model(ref.user).findOne(query, callback);
};

schema.statics.getEmailFromUsername = function(username, callback) {
  if (username.indexOf('@') > -1) {
    return callback(null, username);
  }
  this.model(ref.user).findOne({username: username}, 'email', function(err, user) {
    callback(err, (user ? user.email : null));
  });
};

schema.methods.confirm = function(callback) {
  this.emailConfirmation.confirmed = true;
  callback && this.save(callback);
};

schema.methods.emailConfirmationExpired = function() {
  return moment(this.emailConfirmation.emailSent).diff(moment(), 'days') > 5;
};

schema.methods.isConfirmed = function() {
  return this.emailConfirmation && this.emailConfirmation.confirmed;
};

schema.methods.sendResetPasswordEmail = function(password, callback) {
  this.setPassword(password, function(err, user) {
    user.passwordReset.used = true;
    callback && user.save(callback);
  });
};

schema.methods.passwordResetUsed = function() {
  return this.passwordReset && this.passwordReset.used;
};

schema.methods.passwordResetExpired = function() {
  return moment(this.passwordReset.emailSent).diff(moment(), 'hours') > 2;
};

schema.methods.getDisplayName = function() {
  if (this.name && (this.name.first || this.name.last)) {
    return (this.name.first || '') + ' ' + (this.name.last || '');
  } else if (this.username) {
    return '@' + this.username;
  } else {
    return null;
  }
};

schema.hasProvider = function(provider) {
  return this.connectedAccounts && this.connectedAccounts[provider];
};

schema.methods.isConnected = function(provider) {
  return this.hasProvider(provider) && this.connectedAccounts[provider].accountId;
};

schema.methods.hasRules = function(provider, type) {
  if (!type) {
    return this.hasRules(provider, 'inbound') || this.hasRules(provider, 'outbound');
  } else {
    return this.isConnected(provider) &&
      this.connectedAccounts[provider].rules &&
      this.connectedAccounts[provider].rules[type] &&
      this.connectedAccounts[provider].rules[type].length > 0;
  }
};

schema.methods.hasOutboundRules = function(provider) {
  return this.hasRules(provider, 'outbound');
};

schema.methods.hasInboundRules = function(provider) {
  return this.hasRules(provider, 'inbound');
};

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

function matchesHashtagRule(postHashtags, rule) {
  var ruleTags = rule.constraints.hashtags;
  var containsAny = !ruleTags.any || ruleTags.any.length === 0; // true if this is empty

  for (var i = 0; i < postHashtags.length; i++) {
    var hashtag = postHashtags[i].substring(1);
    if (ruleTags.none.length && _.contains(ruleTags.none, hashtag)) {
      return false;
    }
    if (ruleTags.any.length && _.contains(ruleTags.any, hashtag)) {
      containsAny = true;
    }
    if (ruleTags.all.length && !_.contains(ruleTags.all, hashtag)) {
      return false;
    }
  }
  return containsAny;
}

function getBucketsToPostTo(postContent, rules) {
  var bucketIds = [];
  _.each(rules, function(rule) {
    var ruleHasBuckets = rule.constraints.buckets.all && rule.constraints.buckets.all.length > 0;
    var postHashtags = postContent.match(/\S*#(?:\[[^\]]+\]|\S+)/gi) || [];
    var ruleHasHashtags = rule.constraints.hashtags && rule.constraints.hashtags.length > 0;

    if (ruleHasBuckets && (!ruleHasHashtags || (ruleHasHashtags && postHashtags.length > 0 && matchesHashtagRule(postHashtags, rule)))) {
      bucketIds = bucketIds.concat(rule.constraints.buckets.all);
    }
  });
  return bucketIds;
}

var updateUser = {
  facebook: function(accountInfo, posts) {
    accountInfo.lastImportEpoch = new Date().getTime();
  },
  twitter: function(accountInfo, posts) {
    var largestId = accountInfo.lastImportedTweetId;
    _.each(posts, function(post) {
      var numId = parseInt(post.sourceData.id, 10);
      if (largestId < numId) {
        largestId = numId;
      }
    });
    accountInfo.lastImportedTweetId = largestId;
    accountInfo.lastImportEpoch = new Date().getTime();
  },
  google: function(accountInfo, posts) {
    accountInfo.lastImportEpoch = new Date().getTime();
  }
};

schema.methods.importPosts = function(callback) {
  var allPosts = [];
  var self = this;
  var theProviders = [ 'facebook', 'twitter', 'google' ];
  async.every(theProviders, function(aProvider, done) {
    var providerInfo = self.connectedAccounts[aProvider];
    if (!providerInfo || !providerInfo.token || !self.hasInboundRules(aProvider)) {
      return done(true);
    }
    var timeSinceLastImport = new Date().getTime() - providerInfo.lastImportEpoch;
    var readyForImport = timeSinceLastImport > providerInfo.timeBetweenImports || !providerInfo.lastImportEpoch;

    if (!readyForImport) {
      return done(true);
    }
    providers[aProvider].getPosts(self, function(err, posts) {
      if (!err) {
        updateUser[aProvider](providerInfo, posts);
        _.each(posts, function(post) {
          var postContent = post.content.textString;
          var bucketsToPostTo = getBucketsToPostTo(postContent, providerInfo.rules.inbound);

          if (bucketsToPostTo.length) {
            post.buckets = (post.buckets || []).concat(bucketsToPostTo);
            allPosts.push(post);
          }
        });
      }
      done(!err);
    });
  }, function finishedCreatingPosts(allPostsGotten) {
    if (allPostsGotten) {
      var errors = [];
      async.every(allPosts, function(post, saveCallback) {
        post.save(function(err) {
          if (err) errors.push(err);

          saveCallback(!err);
        });
      }, function(allPostsSaved) {
        if (allPostsSaved) {
          self.save(function(err, user) {
            if (err) callback(err);

            callback(null, user, allPosts, allPosts.length);
          });
        } else {
          callback(new Error('Problem saving posts.' + JSON.stringify(errors)));
        }
      });
    } else {
      callback(new Error('Problem getting posts.'));
    }
  });
};

schema.methods.updateLastLoginTime = function(callback) {
  this.lastLoginDate = new Date();
  this.save(callback);
};

schema.methods.addProfilePicture = function(url, callback) {
  this.profilePicture = url;
  callback && this.save(callback);
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
};

/*
 * Post methods
 */
schema.methods.makePost = function(post, callback) {
  post.author = this.id;
  if (callback) post.save(callback);
};

schema.methods.getPostsAndShares = function(callback) {
  require('./Post').model.find({author: this.id}).sort('-created').exec(callback);
};

schema.statics.getByUsername = function(username, callback) {
  this.model(ref.user).find({username: new RegExp('^' + username + '$', 'i')}, callback);
};

if (process.env.hideBucketStreams) {
  schema.pre('save', function(next) {
    if (!this._doc.profilePicture) {
      var gender = (Math.random()<.5 ? 'men' : 'women');
      var max = 60;
      if (gender === 'men') {
        max = 100;
      }
      this.profilePicture = 'http://api.randomuser.me/0.3.2/portraits/' + gender + '/' + Math.floor(Math.random()*max) + '.jpg';
    }
    next();
  });
}

module.exports = {
  schema: schema,
  model: mongoose.model(ref.user, schema)
};