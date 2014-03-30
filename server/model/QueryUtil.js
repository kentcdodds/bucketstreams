var _ = require('lodash-node');
var Post = require('./Post').model;
var Share = require('./Share').model;

module.exports = {
  getPostsAndShares: function(query, callback) {
    Share.find(query).sort('-created').exec(function(err, shares) {
      var postIds = _.pluck(shares, 'sourcePost');
      if (!_.isEmpty(postIds)) {
        query = {
          $or: [
            query,
            {
              _id: {
                $in: postIds
              }
            }
          ]
        }
      }
      Post.find(query).sort('-created').limit(30).exec(function(err, posts) {
        if (err) return callback(err);
        callback(null, {
          posts: posts,
          shares: shares
        });
      });
    });
  }
};
