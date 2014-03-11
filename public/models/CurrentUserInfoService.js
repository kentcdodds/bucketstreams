angular.module('bs.models').factory('CurrentUserInfoService', function($rootScope, $q, $http, _, User, Stream, Bucket) {
  var things = {
    authenticated: {
      val: null,
      event: 'authenticatedUpdated',
      refresher: function() {
        var deferred = $q.defer();
        $http.get('/api/v1/auth/isAuthenticated').then(function(response) {
          deferred.resolve(response.data.isAuthenticated);
        }, deferred.reject);
        return deferred.promise;
      }
    },
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
    events: {}
  };
  _.each(things, function(thing, thingName) {
    var capThingName = thingName.substring(0, 1).toUpperCase() + thingName.substring(1, thingName.length);

    service['get' + capThingName] = function() {
      return things[thingName].val;
    };

    service['refresh' + capThingName] = function() {
      things[thingName].val = things[thingName].refresher();
      $rootScope.$broadcast(things[thingName].event, things[thingName].val);
      return things[thingName].val;
    };

    service.events[thingName] = things[thingName].event;
  });
  
  service.refreshAuthenticated();
  

  return service;
});