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

      scope.onItemClicked = function(item) {
        scope.selectedItem = item;
        scope.showSubMenu = true;
        if (item.onClick) {
          if (angular.isString(item.onClick)) {
            $state.transitionTo(item.onClick);
          } else {
            item.onClick();
          }
        }
      };

      scope.hideSubMenu = function() {
        scope.showSubMenu = false;
      };

      /*
       * Handle opening and closing the menu
       */
      scope.onMouseEnterOpener = function() {
        if (!scope.large) {
          scope.small = true;
        }
      };

      $document.on('click', function(event) {
        if ((scope.large || scope.small) && !isChild(el[0], event.srcElement)) {
          scope.large = false;
          scope.small = false;
          scope.hideSubMenu();
          scope.$apply();
        }
      });
    }
  }
});
