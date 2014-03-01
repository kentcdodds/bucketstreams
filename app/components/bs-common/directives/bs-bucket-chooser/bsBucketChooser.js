angular.module('bs.directives').directive('bsBucketChooser', function(Bucket, $timeout) {
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

      scope.toggleBucket = function($event, bucket) {
        bucket.isSelected = !bucket.isSelected;
        $event.stopPropagation();
      };

      scope.labelTypes = [
        'default',
        'primary',
        'success',
        'info',
        'warning',
        'danger'
      ];

    }
  }
});