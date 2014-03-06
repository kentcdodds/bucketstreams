angular.module('bs.services').factory('UtilService', function(_, $http, $q, Post, Comment, User, Stream, Bucket) {
  //noinspection UnnecessaryLocalVariableJS
  var util = {
    validateModel: function(model, params) {
      return $http({
        url: '/api/v1/util/validate/' + model,
        method: 'GET',
        params: params
      });
    },
    loadData: function (type, username, typeName) {
      var model = (type === 'stream' ? Stream : Bucket);
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/util/data/' + type,
        params: {
          username: username,
          name: typeName
        }
      }).then(function (response) {
        var thing = response.data.thing;
        var posts = thing.posts;
        _.each(posts, function (post, postIndex) {
          post.authorInfo = new User(post.authorInfo);
          _.each(post.comments, function (comment, commentIndex) {
            comment.authorInfo = new User(comment.authorInfo);
            post.comments[commentIndex] = new Comment(comment);
          });
          posts[postIndex] = new Post(post);
        });
        var result = {};
        result.thing = new model(thing);
        result.posts = posts;
        result.owner = new User(thing.ownerInfo);
        if (response.data.type === 'stream') {
          result.subscriptionsInfo = {};
          _.each(['buckets', 'streams'], function(type) {
            result.subscriptionsInfo[type] = thing.subscriptionsInfo[type] || [];
            _.each(result.subscriptionsInfo[type], function(item, index) {
              result.subscriptionsInfo[type][index].ownerInfo = new User(item.ownerInfo);
            });
          });
        }
        deferred.resolve(result);
      }, deferred.reject);
      return deferred.promise;
    },
    loadPost: function (postId) {
      return $http.get('/api/v1/util/data/post/' + postId);
    }
  };
  return util;
});