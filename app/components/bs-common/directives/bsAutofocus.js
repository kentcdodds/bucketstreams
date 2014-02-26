angular.module('bs.directives').directive('bsAutofocus', function($timeout) {
  return {
    scope: {
      bsAutofocus: '='
    },
    link: function(scope, element, attrs) {
      scope.$watch('bsAutofocus', function(value) {
        if(value) {
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});