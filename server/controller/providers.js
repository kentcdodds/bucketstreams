var twitter = require('twitter');
var facebook = require('fbgraph');
var request = require('request');
var Post = require('../model/Post').model;
var async = require('async');
var logger = require('winston');
var _ = require('lodash-node');

module.exports = {
  facebook: {
    getPosts: function(user, callback) {
      var accountId = user.connectedAccounts.facebook.accountId;
      var token = user.hidden.tokens.facebook;
      var lastImportEpoch = user.connectedAccounts.facebook.lastImportEpoch;
      var queryParams = '?access_token=' + token;
      if (lastImportEpoch) {
        queryParams += '&since=' + lastImportEpoch;
      }

      var statusTypesToNotInclude = ['approved_friend'];

      function makePost(contentTextString, data) {
        if (!contentTextString) {
          return;
        }
        return new Post({
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
      }

      function getFeedPosts(done) {
        facebook.get(accountId + '/feed' + queryParams, function(err, feeds) {
          var posts = [];
          _.each(feeds.data, function(feed) {
            if (!_.contains(statusTypesToNotInclude, feed['status_type']) && feed.message) {
              var post = makePost(feed.message, feed);
              if (post) {
                posts.push(post);
              }
            }
          });
          done(null, posts);
        });
      }

      function getLinkPosts(done) {
        var posts = [];
        facebook.get(accountId + '/links' + queryParams, function(err, links) {
          _.each(links.data, function(link) {
            var message = link.message;
            if (message) {
              message = !link.link || message.indexOf(link.link) > 0 ? message : message + ' ' + link.link;
            } else {
              message = link.link;
            }
            var post = makePost(message, link);
            if (post) {
              posts.push(post);
            }
          });
          done(null, posts);
        });
      }

      function getPostPosts(done) {
        var posts = [];
        facebook.get(accountId + '/posts' + queryParams, function(err, facebookPosts) {
          _.each(facebookPosts.data, function(facebookPost) {
            if (!_.contains(statusTypesToNotInclude, facebookPost['status_type']) && facebookPost.message) {
              var post = makePost(facebookPost.message, facebookPost);
              if (post) {
                posts.push(post);
              }
            }
          });
          done(null, posts);
        });
      }

      async.parallel([getFeedPosts, getLinkPosts, getPostPosts], function(err, results) {
        if (!err) {
          var posts = [].concat(results[0]).concat(results[1]).concat(results[2]);
          posts = _.uniq(posts, function(post) {
            return post.sourceData.sourceId.replace(/\d+_/, '');
          });
          posts = _.sortBy(posts, function(post) {
            return post.created;
          });
        }
        callback(err, posts);
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

      twit.get('/statuses/user_timeline.json', params, function(data) {
        var posts = [];
        _.each(data, function(data) {
          if (!data.text) {
            return;
          }
          posts.push(new Post({
            author: user.id,
            content: {
              textString: data.text
            },
            created: data['created_at'],
            sourceData: {
              source: 'twitter',
              sourceId: data['id_str']
            }
          }));
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