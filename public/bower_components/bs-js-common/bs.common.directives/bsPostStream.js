angular.module('bs.common.directives').directive('bsPostStream', function(_) {
  return {
    restrict: 'A',
    templateUrl: 'templates/bsPostStream.html',
    scope: {
      postsAndShares: '=bsPostStream'
    },
    link: function(scope) {
      scope.$watch('postsAndShares.posts.length + postsAndShares.shares.length', function() {
        if (_.isEmpty(scope.postsAndShares)) {
          return;
        }
        scope.bsPosts = [];
        _.each(scope.postsAndShares.posts, function(post) {
          scope.bsPosts.push({
            post: post,
            sortDate: post.created
          });
        });
        _.each(scope.postsAndShares.shares, function(share) {
          var post = share.getPost();
          scope.bsPosts.push({
            post: post,
            share: share,
            sortDate: share.created
          });
        });
      });
    }
  };
});