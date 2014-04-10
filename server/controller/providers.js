var twitter = require('twitter');
var facebook = require('fbgraph');
var request = require('request');
var Post = require('../model/Post').model;
var async = require('async');
var logger = require('winston');
var _ = require('lodash-node');
var moment = require('moment');
var ProfilePhotoController = require('./ProfilePhotoController');

module.exports = {
  facebook: {
    getProfilePicture: function(user, callback) {
      var accountId = user.connectedAccounts.facebook.accountId;
      var params = {
        height: 512,
        width: 512,
        redirect: false
      };
      facebook.get(accountId + '/picture', params, function(err, response) {
        if (err || !response || !response.data || !response.data.url) return callback(err || {message: 'No picture!'});

        ProfilePhotoController.uploadProfilePhoto({
          url: response.data.url,
          user: user
        }, callback);
      });
    },
    getPosts: function(user, callback) {
      var accountId = user.connectedAccounts.facebook.accountId;
      var token = user.hidden.tokens.facebook;
      var lastImportEpoch = user.connectedAccounts.facebook.lastImportEpoch;
      var params = {
        'access_token': token,
        since: moment(lastImportEpoch).unix(),
        fields: 'id,from,message,status_type,type,created_time,picture,caption,description,link'
      };

      var statusTypesToNotInclude = ['approved_friend'];

      function makePost(contentTextString, data) {
        var post = new Post({
          author: user.id,
          content: {
            textString: contentTextString
          },
          created: data['created_time'],
          sourceData: {
            source: 'facebook',
            sourceId: data.id
          }
        });
        if (data.type === 'photo') {
          post.content.multimedia = {
            images: [{ url: data.picture }]
          };
        }
        post.parse();
        return post;
      }

      var posts = [];
      facebook.get(accountId + '/posts', params, function(err, facebookPosts) {
        if (err) return callback(err);
        _.each(facebookPosts.data, function(facebookPost) {
          if (!_.contains(statusTypesToNotInclude, facebookPost['status_type']) && facebookPost.message) {
            var post = makePost(facebookPost.message, facebookPost);
            posts.push(post);
          }
        });
        callback(null, posts);
      });
    },
    getFeed: function(user, callback) {
      var accountId = user.connectedAccounts.facebook.accountId;
      var token = user.hidden.tokens.facebook;
      var queryParams = '?access_token=' + token;
      facebook.get(accountId + '/home' + queryParams, callback);
    }
  },
  twitter: {
    getProfilePicture: function(user, callback) {
      var userTwitterInfo = user.connectedAccounts.twitter;
      var twit = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: user.hidden.tokens.twitter,
        access_token_secret: user.hidden.secrets.twitter
      });
      var params = {};
      params['user_id'] = userTwitterInfo.accountId;
      twit.get('/users/show.json', params, function(data) {
        var url = data['profile_image_url'];
        if (!url) return callback({ message: 'No Image data!' });

        ProfilePhotoController.uploadProfilePhoto({
          url: url.replace('_normal', ''),
          user: user
        }, callback);
      });
    },
    getPosts: function(user, callback) {
      var userTwitterInfo = user.connectedAccounts.twitter;
      var twit = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: user.hidden.tokens.twitter,
        access_token_secret: user.hidden.secrets.twitter
      });
      var params = {};
      params['user_id'] = userTwitterInfo.accountId;
      if (userTwitterInfo.lastImportedTweetId) {
        params['since_id'] = userTwitterInfo.lastImportedTweetId;
      }

      function makePost(data) {
        var post = new Post({
          author: user.id,
          content: {
            textString: data.text
          },
          created: data['created_at'],
          sourceData: {
            source: 'twitter',
            sourceId: data['id_str']
          }
        });
        post.parse();
        return post;
      }

      twit.get('/statuses/user_timeline.json', params, function(data) {
        var posts = [];
        _.each(data, function(data) {
          if (!data.text) {
            return;
          }
          var post = makePost(data);
          posts.push(post);
        });
        callback(null, posts);
      });
    },
    getFeed: function(user, callback) {
      var twit = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: user.hidden.tokens.twitter,
        access_token_secret: user.hidden.secrets.twitter
      });
      var params = {};
      params['user_id'] = user.connectedAccounts.twitter.accountId;

      twit.get('/statuses/home_timeline.json', params, function(data) {
        callback(null, data);
      });
    }
  },
  google: {
    getPosts: function(user, callback) {
      logger.warn('google not fully supported yet!');
      return;
      var query = {
        key: process.env.GOOGLE_CLIENT_SECRET
      };

      var id = user.connectedAccounts.google.accountId;
      request({
        url: 'https://www.googleapis.com/plus/v1/people/' + id + '/activities/public',
        qs: query
      }, function(err, res, body) {
        console.log('request for posts came back!');
        console.log(arguments);
        callback(err, body);
      });
    },
    getFeed: function(user, callback) {
      callback(null, []);
    }
  }
};