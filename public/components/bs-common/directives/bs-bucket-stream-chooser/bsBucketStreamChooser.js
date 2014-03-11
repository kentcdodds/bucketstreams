angular.module('bs.directives').directive('bsBucketStreamChooser', function($timeout, $filter, _, CommonModalService, AlertService) {
  return {
    restrict: 'E',
    templateUrl: '/components/bs-common/directives/bs-bucket-stream-chooser/bsBucketStreamChooser.html',
    replace: true,
    scope: {
      buckets: '=?',
      streams: '=?',
      bucket: '=?',
      stream: '=?'
    },
    link: function(scope, el, attrs) {
      var opening = null;
      var closing = null;

      if (scope.buckets && scope.streams) {
        throw new Error('Cannot give buckets AND streams to bsBucketStreamChooser!');
      } else if (scope.bucket && scope.stream) {
        throw new Error('Cannot give bucket AND stream to bsBucketStreamChooser!');
      } else if (scope.buckets && (scope.bucket || scope.stream)) {
        throw new Error('Cannot give buckets AND bucket/stream to bsBucketStreamChooser!');
      }

      scope.subscriptionType = attrs.hasOwnProperty('bucket') ? 'buckets' : 'streams';
      scope.subscriptionSubject = scope.stream || scope.bucket;
      scope.listType = attrs.hasOwnProperty('buckets') ? 'bucket' : 'stream';
      scope.listItems = scope.streams || scope.buckets;

      if (scope.streams && scope.subscriptionSubject) {
        _.each(scope.streams, function(stream) {
          stream.selected(stream.isSubscribed(scope.bucket || scope.stream));
        });
      }

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

      scope.toggleThing = function(thing) {
        thing.toggleSelected();
        if (scope.streams) {
          var addMessage = 'Subscribed your ' + thing.name + ' stream to ' + scope.subscriptionSubject.name + '! :-D';
          var removeMessage = 'Unsubscribed your ' + thing.name + ' stream from ' + scope.subscriptionSubject.name + '...';
          thing.toggleSubscription(scope.subscriptionSubject, scope.subscriptionType).then(function() {
            if (thing.isSelected) {
              AlertService.success(addMessage);
            } else {
              AlertService.info(removeMessage);
            }
          }, AlertService.handleResponse.error);
        }
      };

      scope.toggleFirstThing = function($event, search) {
        switch ($event.keyCode) {
          case 13:
            var things = _.filter(scope.listItems, function(thing) { return !thing.isMain });
            things = $filter('filter')(things, search);
            if (things && things.length) {
              scope.toggleThing(things[0]);
              scope.search = '';
            }
            break;
          case 27:
            cancelTimeouts();
            scope.menuOpen = false;
            break;
          case 38:
            // TODO arrow down in the list
            break;
          case 40:
            // TODO arrow up in the list
            break;
        }
      };

      scope.nonMainThings = function() {
        return _.filter(scope.listItems, function(thing) {
          return !thing.isMain;
        });
      };

      scope.createThing = function() {
        CommonModalService.createOrEditBucketStream(scope.listType).result.then(function(newThing) {
          if (newThing) {
            newThing.selected(true);
            scope.listItems.unshift(newThing);
          }
        });
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