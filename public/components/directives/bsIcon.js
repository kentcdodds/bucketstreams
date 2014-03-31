(function() {
  var app = angular.module('bs.web.directives');
  function getIconWithClass(classPrefix, iconAttr) {
    return function(scope, el, attrs) {
      var icon = '<i class="' + classPrefix + attrs[iconAttr] + '"></i>';
      el[attrs.hasOwnProperty('iconAfter') ? 'append' : 'prepend'](icon);
    };
  }

  app.directive('bsIcon', function() {
    return getIconWithClass('glyphicon glyphicon-', 'bsIcon');
  });
  app.directive('faIcon', function() {
    return getIconWithClass('fa fa-', 'faIcon');
  });
})();
