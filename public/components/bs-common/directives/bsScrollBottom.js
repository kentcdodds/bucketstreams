angular.module('bs.directives').directive('bsScrollBottom', function($timeout) {
  return function link(scope, el, attrs) {
    $timeout(function() {
      el[0].scrollTop = el[0].scrollHeight;
    }, 200);
  }
});