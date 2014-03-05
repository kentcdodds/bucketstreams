angular.module('bs.directives').directive('bsMenu', function($document, $timeout, $state) {

  function isChild(el, anEl) {
    var parent = anEl;
    while (parent) {
      if (parent === el) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }

  return {
    restrict: 'A',
    templateUrl: '/components/menu/bsMenu.html',
    scope: {
      options: '=bsMenu'
    },
    link: function(scope, el, attrs) {

      scope.onItemClicked = function($event, item) {
        scope.selectedItem = item;
        scope.showSubMenu = true;
        if (item.onClick) {
          hideMenu();
          if (angular.isString(item.onClick)) {
            $state.go(item.onClick);
          } else {
            item.onClick();
          }
        }
        $event.stopPropagation();
      };

      scope.iBackground = '#03426A';
      scope.iColor = '#FAFCF9';

      var hiding = null;

      scope.onMouseLeave = function() {
        $timeout.cancel(hiding);
        hiding = $timeout(function() {
          scope.small = false;
        }, 200);
      };

      /*
       * Handle opening and closing the menu
       */
      scope.onMouseEnterOpener = function() {
        if (!scope.large) {
          scope.small = true;
        }
      };

      function hideMenu() {
        scope.large = false;
        scope.small = false;
        scope.showSubMenu = false;
      }

      $document.on('click', function($event, event) {
        if ((scope.large || scope.small) && !isChild(el[0], event.srcElement)) {
          hideMenu();
          scope.$apply();
        }
      });
    }
  }
});
