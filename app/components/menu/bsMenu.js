angular.module('bs.directives').directive('bsMenu', function($document) {
  return {
    restrict: 'A',
    templateUrl: '/components/menu/bsMenu.html',
    scope: {
      options: '=bsMenu'
    },
    link: function(scope, el, attrs) {
      scope.$watch('small + large', function() {
        console.log('small', scope.small);
        console.log('large', scope.large);
      });

      scope.opener = {
        onClick: function() {
          scope.small = false;
          scope.large = !scope.large;
        },
        onMouseEnter: function() {
          if (!scope.large) {
            scope.small = true;
          }
        },
        onMouseLeave: function() {
          scope.small = false;
        }
      };

      scope.menu = {
        onMouseEnter: function() {
          scope.small = false;
          scope.large = true;
        }
      };

      function isChild(anEl) {
        var parent = anEl;
        while (parent) {
          if (parent === el[0]) {
            return true;
          }
          parent = parent.parentNode;
        }
        return false;
      }

      $document.on('click', function(event) {
        if ((scope.large || scope.small) && !isChild(event.srcElement)) {
          scope.large = false;
          scope.small = false;
          scope.$apply();
        }
      });
    }
  }
});