var twitter = require('twitter');

module.exports = {
  facebook: {
    getPosts: function(user, callback) {

    }
  },
  twitter: {
    getPosts: function(user, callback) {
      var userTwitterInfo = user.connectedAccounts.twitter;
      var twit = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: userTwitterInfo.token,
        access_token_secret: userTwitterInfo.secret
      });
      var params = {};
      params['user_id'] = userTwitterInfo.accountId;
      if (userTwitterInfo.lastImportedTweetId) {
        params['since_id'] = userTwitterInfo.lastImportedTweetId;
      }
      twit.get('/statuses/user_timeline.json', params, function(data) {
        console.log(data);
        callback(data);
      });
    }
  },
  google: {
    getPosts: function(user, callback) {

    }
  }
};