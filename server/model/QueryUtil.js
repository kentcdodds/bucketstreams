var _ = require('lodash-node');
var async = require('async');
var Post = require('./Post').model;
var Share = require('./Share').model;

module.exports = {
  getPostsAndShares: function(query, options, callback) {
    if (!callback) {
      callback = options;
      options = {
        limit: 20,
        skip: 0
      }
    }
    Share.find(query).sort('-created').exec(function(err, shares) {
      var postIds = _.pluck(shares, 'sourcePost');

      function findSharePosts(done) {
        if (_.isEmpty(postIds)) return done(null, []);
        Post.find({_id: { $in: postIds }}, done);
      }
      function queryForPosts(done) {
        Post.find(query).sort('-created').limit(options.limit).skip(options.skip).exec(done);
      }

      async.parallel([findSharePosts, queryForPosts], function(err, results) {
        if (err) return callback(err);
        callback(null, {
          sharePosts: results[0],
          posts: results[1],
          shares: shares
        });
      });
    });
  }
};
