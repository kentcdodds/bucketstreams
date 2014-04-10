angular.module('bs.common.models').factory('CurrentUserInfoService', function($rootScope, $q, $http, _, User, Stream, Bucket, Cacher) {
  var things = {
    user: {
      val: null,
      event: 'userUpdated',
      refresher: function() {
        var user = User.get({id: 'me'});
        user.$promise.then(function() {
          Cacher.userCache.putById(user);
        });
        return user;
      }
    },
    buckets: {
      val: [],
      event: 'bucketsUpdated',
      refresher: function() {
        var buckets = Bucket.query({owner: 'me'});
        buckets.$promise.then(function() {
          Cacher.bucketCache.putAllById(buckets);
        });
        return buckets;
      }
    },
    streams: {
      val: [],
      event: 'streamsUpdated',
      refresher: function() {
        var streams = Stream.query({owner: 'me'});
        streams.$promise.then(function() {
          Cacher.streamCache.putAllById(streams);
        });
        return streams;
      }
    }
  };

  var service = {
    events: {
      user: null, buckets: null, streams: null
    },
    isAuthenticated: function() {
      return !!localStorage.getItem('user-token');
    },
    getBuckets: null, setBuckets: null, refreshBuckets: null, resolveBuckets: null,
    getStreams: null, setStreams: null, refreshStreams: null, resolveStreams: null,
    getUser: null, setUser: null, refreshUser: null, resolveUser: null
  };
  service.resolveAuthenticated = service.isAuthenticated;
  _.each(things, function(thing, thingName) {
    var capThingName = thingName.substring(0, 1).toUpperCase() + thingName.substring(1, thingName.length);

    service['get' + capThingName] = function() {
      return things[thingName].val;
    };

    service['set' + capThingName] = function(newVal) {
      things[thingName].val = newVal;
      $rootScope.$broadcast(things[thingName].event, things[thingName].val);
      return things[thingName].val;
    };

    service['refresh' + capThingName] = function() {
      return service['set' + capThingName](things[thingName].refresher());
    };

    service['resolve' + capThingName] = function() {
      if (!service.isAuthenticated()) return null;

      var thingVal = service['get' + capThingName]();
      if (_.isEmpty(thingVal)) {
        thingVal = service['refresh' + capThingName]();
      }
      if (thingVal.hasOwnProperty('$resolved')) {
        if (thingVal.$resolved) {
          return thingVal;
        } else {
          return thingVal.$promise;
        }
      } else {
        return thingVal;
      }
    };

    service.events[thingName] = things[thingName].event;
  });

  return service;
});