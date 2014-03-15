angular.module('bs.directives').directive('bsBucketList', function() {
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
      scope.templateName = 'bs-bucket-list-' + Math.floor(Math.random() * 500) + '.html';
      var totalChars = 0;
      if (!_.isEmpty(scope.maxChars)) {
        _.each(scope.buckets, function(bucket, index) {
          scope.bucketPageParams[index] = bucket.getPageParams();
          if (bucket.isMain) return;
          totalChars += bucket.name.length + 2; // + 2 for the comma and space
          if (totalChars <= scope.maxChars) {
            scope.visibleBuckets.push(bucket);
          }
        });
        scope.showElipsis = totalChars > scope.maxChars;
      } else {
        scope.visibleBuckets = scope.buckets;
      }
    }
  }
});