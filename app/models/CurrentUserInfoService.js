angular.module('bs.models').factory('CurrentUserInfoService', function($rootScope, User, Stream, Bucket, _) {
  var things = {
    user: {
      event: 'userUpdated',
      getter: function() {
        return User.get({id: 'me'});
      }
    },
    buckets: {
      event: 'bucketsUpdated',
      getter: function() {
        return Bucket.query({owner: 'me'});
      }
    },
    streams: {
      event: 'streamsUpdated',
      getter: function() {
        return Stream.query({owner: 'me'});
      }
    }
  };

  var service = {
    events: {}
  };
  _.each(things, function(thing, thingName) {
    var capThingName = thingName.substring(0, 1).toUpperCase() + thingName.substring(1, thingName.length);
    things[thingName].val = things[thingName].getter();

    service['get' + capThingName] = function() {
      return things[thingName].val;
    };

    service['refresh' + capThingName] = function() {
      things[thing].val = things[thing].getter();
      $rootScope.$broadcast(things[thing].event, things[thing].val);
      return things[thing].val;
    };

    service.events[thingName] = things[thingName].event;
  });

  return service;
});