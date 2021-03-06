angular.module('bs.web.directives').directive('bsBucketStreamChooser', function($timeout, $filter, _, CommonModalService, AlertEventBroadcaster, CurrentUserInfoService) {
  return {
    restrict: 'E',
    templateUrl: 'templates/bsBucketStreamChooser.html',
    replace: true,
    scope: {
      buckets: '=?',
      streams: '=?',
      bucket: '=?',
      stream: '=?',
      noThingSelectedText: '=?'
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

      scope.subscriptionType = scope.bucket ? 'bucket' : 'stream';
      scope.subscriptionSubject = scope.stream || scope.bucket;
      if (attrs.hasOwnProperty('buckets')) {
        scope.listType = 'bucket';
        scope.icon = 'bitbucket';
      } else {
        scope.listType = 'stream';
        scope.icon = 'smile-o';
      }
      scope.listItems = scope.streams || scope.buckets;

      scope.$on(CurrentUserInfoService.events[scope.listType + 's'], function(event, things) {
        scope.listItems = things;
      });

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
          var removeMessage = 'unsubscription of your ' + thing.name + ' stream from ' + scope.subscriptionSubject.name + ' was successful...';
          thing.toggleSubscription(scope.subscriptionSubject, scope.subscriptionType + 's').then(function() {
            if (thing.isSelected) {
              AlertEventBroadcaster.broadcast({
                message: addMessage,
                type: 'success'
              });
            } else {
              AlertEventBroadcaster.broadcast({
                message: removeMessage,
                type: 'info'
              });
            }
          }, AlertEventBroadcaster.getResponseHandler('error'));
        }
      };

      if (!scope.noThingSelectedText) {
        if (scope.listType === 'stream') {
          scope.noThingSelectedText = 'Subscribe this ' + scope.subscriptionType + ' to some streams...';
        } else {
          scope.noThingSelectedText = 'Choose buckets to post to...';
        }
      }

      scope.toggleFirstThing = function($event, search) {
        switch ($event.keyCode) {
          case 13:
            var things = _.reject(scope.listItems, function(thing) { return thing.isMain });
            things = $filter('filter')(things, search);
            if (things && things.length) {
              scope.toggleThing(things[0]);
              scope.search = '';
            }
            $event.preventDefault();
            $event.stopPropagation();
            break;
          case 27:
            cancelTimeouts();
            scope.menuOpen = false;
            $event.preventDefault();
            $event.stopPropagation();
            break;
          case 38:
            // TODO arrow down in the list
            break;
          case 40:
            // TODO arrow up in the list
            break;
        }
      };

      scope.applicableThings = function() {
        return _.filter(scope.listItems, function(thing) {
          return !thing.isMain && !(scope.subscriptionSubject && scope.subscriptionSubject._id === thing._id);
        });
      };

      scope.createThing = function() {
        CommonModalService.createOrEditBucketStream(scope.listType);
      };

      scope.labelTypes = [
        'blue',
        'brown',
        'success',
        'danger',
        'default',
        'info',
        'primary',
        'warning'
      ];

      scope.$watch(function() {
        return _.filter(scope.listItems, {isSelected: true}).length;
      }, function(totalSelected) {
        scope.showMain = scope.listType === 'bucket' || (scope.listType === 'stream' && totalSelected > 0);
        scope.thingsSelected = totalSelected > 0;
      });

    }
  }
});