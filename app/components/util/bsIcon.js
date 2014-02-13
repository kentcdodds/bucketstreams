(function() {
  var app = angular.module('bs.directives');
  function getIconWithClass(classPrefix, iconAttr) {
    return function(scope, el, attrs) {
      var icon = '<i class="' + classPrefix + attrs[iconAttr] + '"></i>';
      if (attrs.hasOwnProperty('iconBefore')) {
        el.prepend(icon + ' ')
      } else {
        el.append(' ' + icon)
      }
    };
  }

  app.directive('bsIcon', function() {
    return getIconWithClass('glyphicon glyphicon-', 'bsIcon');
  });
  app.directive('faIcon', function() {
    return getIconWithClass('fa fa-', 'faIcon');
  });
})();
