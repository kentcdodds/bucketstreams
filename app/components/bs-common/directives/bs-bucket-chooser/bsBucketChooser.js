angular.module('bs.directives').directive('bsBucketChooser', function(Bucket, $timeout, $filter) {
  return {
    restrict: 'E',
    templateUrl: '/components/bs-common/directives/bs-bucket-chooser/bsBucketChooser.html',
    replace: true,
    scope: {
      user: '=?',
      userId: '@?'
    },
    link: function(scope, el) {
      scope.buckets = Bucket.query({
        owner: scope.user ? scope.user._id : scope.userId
      });

      var opening = null;
      var closing = null;

      scope.onClick = function() {
        $timeout.cancel(closing);
        scope.menuOpen = !scope.menuOpen;
      };

      scope.onMouseEnter = function() {
        cancelTimeouts();
        opening = $timeout(function() {
          scope.menuOpen = true;
        }, 200);
      };

      scope.onMouseLeave = function() {
        cancelTimeouts();
        closing = $timeout(function() {
          scope.menuOpen = false;
        }, 400);
      };

      function cancelTimeouts() {
        $timeout.cancel(opening);
        $timeout.cancel(closing);
      }

      scope.noBubbles = function($event) {
        $event.stopPropagation();
      };

      scope.toggleBucket = function(bucket) {
        bucket.isSelected = !bucket.isSelected;
      };

      scope.toggleFirstBucket = function($event, search) {
        switch ($event.keyCode) {
          case 13:
            var buckets = _.filter(scope.buckets, function(bucket) { return !bucket.isMain });
            buckets = $filter('filter')(buckets, search);
            if (buckets && buckets.length) {
              scope.toggleBucket(buckets[0]);
              scope.search = '';
            }
            break;
          case 27:
            cancelTimeouts();
            scope.menuOpen = false;
            break;
        }
      };

      scope.labelTypes = [
        'default',
        'success',
        'info',
        'warning',
        'danger',
        'primary'
      ];

    }
  }
});