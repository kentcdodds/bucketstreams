angular.module('bs.web.directives').directive('bsMenu', function($document, $timeout, $state) {

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
    templateUrl: 'templates/bsMenu.html',
    scope: {
      bsMenu: '=bsMenu'
    },
    link: function(scope, el, attrs) {
      function safeApply(fn) {
        var phase = scope.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
          scope.$eval(fn);
        }
        else {
          scope.$apply(fn);
        }
      }
      
      scope.options = _.compact(scope.bsMenu);
      
      scope.$watch('bsMenu', function(newVal) {
        scope.options = _.compact(newVal);
      }, true);

      scope.onItemClicked = function($event, item) {
        scope.selectedItem = item;
        if (item.onClick) {
          hideMenu();
          if (angular.isString(item.onClick)) {
            $state.go(item.onClick);
          } else {
            item.onClick();
          }
        } else if (item.children && item.children.length) {
          scope.large = true;
          scope.showSubMenu = true;
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

      $document.on('click keyup', function(event) {
        var menuIsOpen = scope.large || scope.small;
        if (!menuIsOpen) return;

        var escapePressed = event.keyCode == 27;
        var clickedOutOfMenu = event.keyCode == 0 && !isChild(el[0], event.srcElement);
        if (escapePressed || clickedOutOfMenu) {
          safeApply(hideMenu);
        }
      });
    }
  }
});
