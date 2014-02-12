angular.module('bs.directives').directive('bsIcon', function() {
  return function(scope, el, attrs) {
    if (attrs.after) {
      el.append('<i class="' + attrs.after + '"></i>')
    }
    if (attrs.before) {
      el.prepend('<i class="' + attrs.before + '"></i>')
    }
  };
});