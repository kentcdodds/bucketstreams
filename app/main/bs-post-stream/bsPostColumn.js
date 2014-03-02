angular.module('bs.app').filter('bsPostColumn', function() {
  return function(items, column, columns) {
    var filtered = [];
    angular.forEach(items, function(item, index) {
      if (index % columns === (column - 1)) {
        filtered.push(item);
      }
    });
    return filtered;
  };
});