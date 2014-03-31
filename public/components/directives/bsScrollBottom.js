angular.module('bs.web.directives').directive('bsScrollBottom', function($timeout) {
  return function link(scope, el, attrs) {
    scope.$watch(attrs.bsScrollBottom, scroll);
    function scroll(newVal) {
      if (newVal) {
        el[0].scrollTop = el[0].scrollHeight;
        scope[attrs.bsScrollBottom] = false;
      }
    }
    $timeout(function() {
      scroll(true);
    }, 200);
  }
});