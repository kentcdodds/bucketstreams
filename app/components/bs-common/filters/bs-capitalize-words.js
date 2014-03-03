angular.module('bs.filters').filter('bsCapitalizeWords', function() {
  return function(input) {
    return (input || '').toLowerCase().replace(/(?:^|\s)\S/g, function(character) {
      return character.toUpperCase();
    });
  }
});