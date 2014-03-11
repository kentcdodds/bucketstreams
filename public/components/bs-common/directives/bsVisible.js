angular.module('bs.directives').directive('bsVisible', function() {
  return {
    scope: {
      bsVisible: '='
    },
    link: function(scope, el) {
      scope.$watch('bsVisible', function(val) {
        if (val) {
          el.css('visibility', 'visible');
        } else {
          el.css('visibility', 'hidden');
        }
      });
    }
  };
});