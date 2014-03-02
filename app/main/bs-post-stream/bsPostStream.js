angular.module('bs.app').directive('bsPostStream', function() {
  return {
    restrict: 'A',
    templateUrl: '/main/bs-post-stream/bsPostStream.html',
    scope: {
      posts: '=bsPostStream'
    },
    link: function(scope, el, attrs) {}
  };
});