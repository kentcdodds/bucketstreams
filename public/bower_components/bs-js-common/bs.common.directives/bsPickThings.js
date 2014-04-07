angular.module('bs.common.directives').directive('bsPickThings', function(_) {
  return {
    restrict: 'A',
    templateUrl: 'templates/bsPickThings.html',
    scope: {
      sections: '=bsPickThings'
    },
    link: function(scope) {
      var cols = 4;

      // split section's things into rows of twelve
      if (!_.find(scope.sections, 'isOpen')) {
        scope.sections[0].isOpen = true;
      }
      _.each(scope.sections, function(section) {
        section.rows = [];
        _.each(section.things, function(thing, index) {
          section.rows[Math.floor(index / cols)] = section.rows[Math.floor(index / cols)] || [];
          section.rows[Math.floor(index / cols)][index % cols] = thing;
        });
      });
      console.log(scope.sections);
    }
  }
});