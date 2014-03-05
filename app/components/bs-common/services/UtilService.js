angular.module('bs.services').factory('UtilService', function(_, $http, $q, Post, Comment, User, Stream, Bucket) {
  //noinspection UnnecessaryLocalVariableJS
  var util = {
    testUniqueness: function (model, field, value) {
      return $http({
        url: '/api/v1/util/unique/' + model,
        method: 'GET',
        params: {
          field: field,
          value: value
        }
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
        var one = response.data[type];
        var posts = response.data.posts;
        _.each(posts, function (post, postIndex) {
          post.authorInfo = new User(post.authorInfo);
          _.each(post.comments, function (comment, commentIndex) {
            comment.authorInfo = new User(comment.authorInfo);
            post.comments[commentIndex] = new Comment(comment);
          });
          posts[postIndex] = new Post(post);
        });
        var result = {};
        result[type] = new model(one);
        result.posts = posts;
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