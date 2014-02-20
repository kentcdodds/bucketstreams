angular.module('bs.models').factory('Stream', function($resource, Post, Comment, $http, $q, _) {
  var Stream = $resource('/api/v1/streams/:id', { id: '@_id' });
  Stream.prototype.isPublic = function() {
    return this.visibility.length === 0;
  };

  Stream.prototype.getPostData = function() {
    var deferred = $q.defer();
    $http.get('/api/v1/streams/' + this._id + '/posts').then(function(response) {
      var posts = response.data;
      _.each(posts, function(post, postIndex) {
        _.each(post.comments, function(comment, commentIndex) {
          post.comments[commentIndex] = new Comment(comment);
        });
        posts[postIndex] = new Post(post);
      });
      deferred.resolve(posts);
    }, deferred.reject);
    return deferred.promise;
  };
  return Stream;
});