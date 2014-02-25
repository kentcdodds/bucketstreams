angular.module('bs.directives').directive('bsMenu', function($document, $timeout) {

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
        $timeout.cancel(clearSelectedItem);
        scope.selectedItem = item;
        scope.showSubMenu = true;
        item.onClick && item.onClick();
      };

      var clearSelectedItem = null;

      scope.hideSubMenu = function() {
        scope.showSubMenu = false;
        clearSelectedItem = $timeout(function() {
          scope.selectedItem = null;
        }, 1000);
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
          console.log('clicked');
          scope.$apply();
        }
      });
    }
  }
});
