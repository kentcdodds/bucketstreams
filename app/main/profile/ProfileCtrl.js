angular.module('bs.app').controller('ProfileCtrl', function($scope, currentUser, profileUser, buckets, streams, CurrentUserService, CurrentContext) {
  $scope.currentUser = currentUser;
  $scope.profileUser = profileUser;
  $scope.buckets = buckets;
  $scope.streams = streams;

  CurrentContext.context(profileUser.getDisplayName());
});