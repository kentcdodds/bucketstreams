angular.module('bs.common.directives').directive('bsPostStream', function(_, UtilService) {
  return {
    restrict: 'A',
    templateUrl: 'templates/bsPostStream.html',
    scope: {
      postsAndShares: '=bsPostStream',
      type: '@',
      username: '@',
      name: '@'
    },
    link: function(scope, el, attrs) {
      var page = 1;
      scope.loadMorePosts = function() {
        scope.loadingPosts = true;
        page++;
        UtilService.loadData(scope.type, scope.username, scope.name, {
          page: page
        }).then(function(data) {
          scope.noMorePosts = !data.posts.length;
          scope.loadingPosts = false;
          scope.postsAndShares.posts = scope.postsAndShares.posts.concat(data.posts);
          scope.postsAndShares.shares = scope.postsAndShares.shares.concat(data.shares);
        });
      };
      window.BS.loadMore = scope.loadMorePosts;
      scope.$watch('postsAndShares.posts.length + postsAndShares.shares.length', function() {
        if (_.isEmpty(scope.postsAndShares)) {
          return;
        }
        scope.bsPosts = [];
        _.each(scope.postsAndShares.posts, function(post) {
          if (!attrs.authorToShow || attrs.authorToShow === post.author) {
            scope.bsPosts.push({
              post: post,
              sortDate: post.created
            });
          }
        });
        _.each(scope.postsAndShares.shares, function(share) {
          var post = share.getPost();
          if (!attrs.authorToShow || attrs.authorToShow === share.author) {
            scope.bsPosts.push({
              post: post,
              share: share,
              sortDate: share.created
            });
          }
        });
      });
    }
  };
});