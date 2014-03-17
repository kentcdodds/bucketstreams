angular.module('bs.filters').filter('bsFilterMain', function(_) {
  return function(items) {
    return _.filter(items, function(item) {
      return !item.isMain;
    });
  };
});