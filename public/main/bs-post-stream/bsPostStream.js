angular.module('bs.app').directive('bsPostStream', function($window, $filter) {
  return {
    restrict: 'A',
    templateUrl: '/main/bs-post-stream/bsPostStream.html',
    scope: {
      postsAndShares: '=bsPostStream'
    },
    link: function(scope, el, attrs) {
      scope.posts = scope.postsAndShares.posts;
      _.each(scope.posts, function(post) {
        post.sortDate = post.created;
      });
      _.each(scope.postsAndShares.shares, function(share) {
        var post = share.getPost();
        post.sortDate = share.created;
        post.share = share;
        if (!_.contains(scope.posts, post)) {
          scope.posts.push(post);
        }
      });
    }
  };
});