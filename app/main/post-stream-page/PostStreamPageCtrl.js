angular.module('bs.app').controller('PostStreamPageCtrl', function($scope, $state, data, $modal, AlertService, CommonModalService, CurrentUserInfoService) {
  $scope.thing = data.thing;
  $scope.posts = data.posts;
  $scope.type = data.type;
  $scope.isStream = data.type === 'stream';
  $scope.owner = data.owner;
  if ($scope.isStream) {
    $scope.subscriptionsInfo = data.subscriptionsInfo;
  }
  $scope.currentUserIsOwner = $scope.currentUser._id === $scope.thing.owner;
  $scope.streams = CurrentUserInfoService.getStreams();
  $scope.editThing = function() {
    CommonModalService.createOrEditBucketStream($scope.type, $scope.thing).result.then(function(theThing) {
      if ($scope.thing === theThing) {
        console.warn('already equal');
      }
      if (theThing) {
        $scope.thing = theThing;
      }
    });
  };
});