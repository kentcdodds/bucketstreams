angular.module('bs.common.services').factory('ShareBroadcaster', function($rootScope) {
  var newShare = 'createdNewShare';
  var removedShare = 'removedShare';
  
  return {
    broadcastNewShare: function(share) {
      $rootScope.$broadcast(newShare, share);
    },
    broadcastRemovedShare: function(share) {
      $rootScope.$broadcast(removedShare, share);
    },
    newShareEvent: newShare,
    removedShareEvent: removedShare
  }
});