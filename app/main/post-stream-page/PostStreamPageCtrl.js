angular.module('bs.app').controller('PostStreamPageCtrl', function($scope, $state, data, $modal, AlertService, CommonModalService) {
  $scope.thing = $scope[data.type] = data[data.type];
  $scope.posts = data.posts;
  $scope.type = data.type;
  $scope.currentUserIsOwner = $scope.currentUser._id === $scope.thing.owner;
  $scope.deleteThing = function() {
    CommonModalService.deleteBucketStream($scope.type, $scope.thing);
  };
});