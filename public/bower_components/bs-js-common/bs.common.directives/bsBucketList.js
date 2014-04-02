angular.module('bs.common.directives').directive('bsBucketList', function($q, UtilFunctions) {
  return {
    restrict: 'A',
    templateUrl: 'templates/bsBucketList.html',
    scope: {
      buckets: '=bsBucketList',
      maxChars: '@'
    },
    link: function(scope, el, attrs) {
      scope.visibleBuckets = [];
      scope.bucketPageParams = [];
      var totalChars = 0;
      function loadVisibleBuckets() {
        var mainlessBuckets = _.filter(scope.buckets, function(item) {
          return !item.isMain;
        });
        _.each(mainlessBuckets, function(bucket, index) {
          scope.bucketPageParams[index] = bucket.getPageParams();
          totalChars += bucket.name.length + 2; // + 2 for the comma and space
          if (totalChars <= scope.maxChars) {
            scope.visibleBuckets.push(bucket);
          }
        });
      }
      if (!_.isEmpty(scope.maxChars)) {
        scope.$watch('buckets', function(buckets) {
          var initialPromises = UtilFunctions.getResourcePromises(buckets);
          $q.all(initialPromises).then(loadVisibleBuckets);
        });
        scope.showElipsis = totalChars > scope.maxChars;
      } else {
        scope.visibleBuckets = scope.buckets;
      }
    }
  }
});