angular.module('bs.common.services').factory('PostBroadcaster', function($rootScope) {
  var newPost = 'createdNewPost';
  var removedPost = 'removedPost';
  
  return {
    broadcastNewPost: function(post) {
      $rootScope.$broadcast(newPost, post);
    },
    broadcastRemovedPost: function(post) {
      $rootScope.$broadcast(removedPost, post);
    },
    newPostEvent: newPost,
    removedPostEvent: removedPost
  }
});