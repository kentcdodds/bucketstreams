angular.module('bs.app').directive('bsPostStream', function($window, $filter) {
  return {
    restrict: 'A',
    templateUrl: '/main/bs-post-stream/bsPostStream.html',
    scope: {
      postsAndShares: '=bsPostStream'
    },
    link: function(scope, el, attrs) {
      var three = [0,1,2];
      var two = [0,1];
      var one = [0];
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
      function setColumns(cols, noApply) {
        scope.columns = cols;
        if (!noApply) {
          scope.$apply();
        }
      }

      function resetColumns(noApply) {
        var w = $window.innerWidth;
        if (w >= 1080 && scope.columns != three) {
          setColumns(three, noApply);
        } else if (w < 1080 && w >= 650 && scope.columns != two) {
          setColumns(two, noApply);
        } else if (w < 650 && scope.columns != one){
          setColumns(one, noApply);
        }
      }

      resetColumns(true);
      $window.onresize = function() {
        resetColumns(false);
      };

      scope.getPostsForColumn = function(column) {
        var postsForColumn = [];
        var posts = $filter('orderBy')(scope.posts, 'sortDate', true);
        angular.forEach(posts, function(post, index) {
          if (index % scope.columns.length === column) {
            postsForColumn.push(post);
          }
        });
        return postsForColumn;
      };
    }
  };
});