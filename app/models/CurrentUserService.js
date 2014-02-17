angular.module('bs.models').factory('CurrentUserService', function($rootScope, User) {
  var currentUser = User.get({id: 'me'});
  var eventName = 'currentUserUpdated';

  function broadcastStateChange(user) {
    $rootScope.$broadcast(eventName, user);
  }

  return {
    getUser: function() {
      return currentUser;
    },
    refreshUser: function() {
      currentUser = User.get({id: 'me'});
      broadcastStateChange(currentUser);
      return currentUser;
    },
    userUpdateEvent: eventName
  }
});