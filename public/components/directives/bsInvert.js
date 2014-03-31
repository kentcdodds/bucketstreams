angular.module('bs.web.directives').directive('bsInvert', function() {
  return function(scope, el, attrs) {
    var background = attrs.iBackground;
    var color = attrs.iColor;
    function applyToAllTheThings(property, value) {
      el.css(property, value);
      el.find('*').css(property, value);
    }

    el.on('mouseenter', function() {
      applyToAllTheThings('background-color', color);
      applyToAllTheThings('color', background);
    });

    el.on('mouseleave', function() {
      applyToAllTheThings('background-color', background);
      applyToAllTheThings('color', color);
    });
  }
});