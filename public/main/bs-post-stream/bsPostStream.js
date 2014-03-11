angular.module('bs.app').directive('bsPostStream', function($window, $filter) {
  return {
    restrict: 'A',
    templateUrl: '/main/bs-post-stream/bsPostStream.html',
    scope: {
      posts: '=bsPostStream'
    },
    link: function(scope, el, attrs) {
      var three = [0,1,2];
      var two = [0,1];
      var one = [0];
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
        var posts = $filter('orderBy')(scope.posts, 'created', true);
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