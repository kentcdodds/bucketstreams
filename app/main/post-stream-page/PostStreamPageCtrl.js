angular.module('bs.app').controller('PostStreamPageCtrl', function($scope, $state, data, $modal, AlertService, CommonModalService, CurrentUserInfoService) {
  $scope.thing = $scope[data.type] = data[data.type];
  $scope.posts = data.posts;
  $scope.type = data.type;
  $scope.owner = data.owner;
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