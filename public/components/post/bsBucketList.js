angular.module('bs.directives').directive('bsBucketList', function(UtilFunctions) {
  return {
    restrict: 'A',
    templateUrl: '/components/post/bsBucketList.html',
    scope: {
      buckets: '=bsBucketList',
      maxChars: '@'
    },
    link: function(scope, el, attrs) {
      scope.visibleBuckets = [];
      scope.bucketPageParams = [];
      var totalChars = 0;
      if (!_.isEmpty(scope.maxChars)) {
        scope.$watch(scope.buckets, function() {
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
        });
        scope.showElipsis = totalChars > scope.maxChars;
      } else {
        scope.visibleBuckets = scope.buckets;
      }
    }
  }
});