angular.module('bs.common.directives').directive('bsAutofocus', function($timeout, $document) {
  return {
    scope: {
      bsAutofocus: '=',
      refocus: '@'
    },
    link: function(scope, element, attrs) {
      var previousEl = null;
      var el = element[0];
      var doc = $document[0];
      scope.$watch('bsAutofocus', function(value) {
        if(value) {
          $timeout(function() {
            previousEl = doc.activeElement;
            el.focus();
          });
        } else {
          if (previousEl && attrs.refocus && doc.activeElement === el) {
            el.blur();
            previousEl.focus();
          }
        }
      });
    }
  };
});