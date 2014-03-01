angular.module('bs.models').factory('Stream', function($resource, Post, Comment, $http, $q, _) {
  var Stream = $resource('/api/v1/rest/streams/:id', { id: '@_id' });

  Stream.getStreamData = function(username, streamName) {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url:'/api/v1/util/streamData',
      params: {
        username: username,
        streamName: streamName
      }
    }).then(function(response) {
      var stream = response.data.stream;
      var posts = response.data.posts;
      _.each(posts, function(post, postIndex) {
        _.each(post.comments, function(comment, commentIndex) {
          post.comments[commentIndex] = new Comment(comment);
        });
        posts[postIndex] = new Post(post);
      });
      deferred.resolve({
        stream: new Stream(stream),
        posts: posts
      });
    }, deferred.reject);
    return deferred.promise;
  };

  Stream.prototype.isPublic = function() {
    return this.visibility.length === 0;
  };


  Stream.prototype.getPostData = function() {
    var deferred = $q.defer();
    $http.get('/api/v1/util/streams/' + this._id + '/posts').then(function(response) {
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