angular.module('bs.common.models').factory('CurrentUserInfoService', function($rootScope, $q, $http, _, User, Stream, Bucket) {
  var things = {
    user: {
      val: null,
      event: 'userUpdated',
      refresher: function() {
        return User.get({id: 'me'});
      }
    },
    buckets: {
      val: [],
      event: 'bucketsUpdated',
      refresher: function() {
        return Bucket.query({owner: 'me'});
      }
    },
    streams: {
      val: [],
      event: 'streamsUpdated',
      refresher: function() {
        return Stream.query({owner: 'me'});
      }
    }
  };

  // The service will have methods called getUser and refreshUser (as well as streams and buckets)
  var service = {
    events: {},
    isAuthenticated: function() {
      return !!localStorage.getItem('user-token');
    }
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