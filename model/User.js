var Util = require('./Util');
var Image = require('./Image').schema;
var ref = require('./ref');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Email = mongoose.SchemaTypes.Email;

var mongooseAuth = require('mongoose-auth');
var everyauth = require('everyauth');
var Promise = everyauth.Promise;

/**
 * User:
 *   profilePicture: An array of profile pictures of the user where the last one is the current profile picture.
 *   lastLoginDate: The date the user last logged in.
 */
var schema = new Schema({
  profilePicture: [Image],
  lastLoginDate: {type: Date, default: Date.now}
});

var model;

Util.addTimestamps(schema);
schema.plugin(mongooseAuth, {
  everymodule: {
    everyauth: {
      User: function () {
        return model;
      }
    }
  },
  facebook: {
    everyauth: {
      myHostname: process.env.BASE_URL,
      appId: process.env.VENDOR_FACEBOOK_APP_ID,
      appSecret: process.env.VENDOR_FACEBOOK_SECRET,
      redirectPath: '/',
      findOrCreateUser: function(session, accessTok, accessTokExtra, fbUser) {
        return findOrCreateUser(this, 'facebook', session, accessTok, accessTokExtra, fbUser);
      }
    }
  },
  google: {
    everyauth: {
      myHostname: process.env.BASE_URL,
      appId: process.env.GOOGLE_CLIENT_ID,
      appSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: 'https://www.googleapis.com/auth/plus.login',
      redirectPath: '/',
      findOrCreateUser: function(session, accessTok, accessTokExtra, user) {
        return findOrCreateUser(this, 'google', session, accessTok, accessTokExtra, user);
      }
    }
  },
  twitter: {
    everyauth: {
      myHostname: process.env.BASE_URL,
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      redirectPath: '/',
      findOrCreateUser: function(session, accessTok, accessTokExtra, user) {
        return findOrCreateUser(this, 'twitter', session, accessTok, accessTokExtra, user);
      }
    }
  },
  password: {
    extraParams: {
      phone: String,
      email: Email,
      name: {
        first: String,
        last: String
      }
    },
    everyauth: {
      getLoginPath: '/',
      postLoginPath: '/login',
      loginView: 'index',
      getRegisterPath: '/',
      postRegisterPath: '/register',
      registerView: 'index',
      loginSuccessRedirect: '/',
      registerSuccessRedirect: '/'
    }
  }
});

function findOrCreateUser(context, type, session, accessTok, accessTokExtra, providedUser) {
  console.log('finding or creating user of type ' + type, ' auth: ', session.auth);
  var promise = context.Promise();
  var User = context.User()();

  if (!session.auth || !session.auth.userId || !session.auth.loggedIn) {
    promise.fail(new Error('User not logged in'));
  }

  User.findById(session.auth.userId, function (err, user) {
    if (err) return promise.fail(err);

    if (!user) {
      promise.fail(new Error('No existing user in database'));
    } else {
      assignDataToUser[type](user, accessTok, accessTokExtra, providedUser);

      // Save the new data to the user doc in the db
      user.save(function (err, user) {
        if (err) return promise.fail(err);

        promise.fuilfill(user);
      });
    }

  });
  return promise; // Make sure to return the promise that promises the user
}

var assignDataToUser = {
  google: function(user, accessTok, accessTokExtra, googleUser) {
    // TODO implementation
  },
  twitter: function(user, accessTok, accessTokExtra, googleUser) {
    // TODO implementation
  },
  facebook: function(user, accessTok, accessTokExtra, fbUser) {
    user.fb.accessToken = accessTok;
    user.fb.expires = accessTokExtra.expires;
    user.fb.id = fbUser.id;
    user.fb.name.first = fbUser.first_name;
    // etc. more assigning...
  }
};

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

model = mongoose.model(ref.user, schema);

module.exports = {
  schema: schema,
  model: model
};