angular.module('bs.directives').directive('bsStream', function() {
  return {
    restrict: 'A',
    templateUrl: '/components/stream/bsStream.html',
    replace: true,
    scope: {
      stream: '=bsStream',
      currentUser: '=?'
    },
    link: function(scope, el) {

    }
  }
});