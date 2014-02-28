angular.module('bs.app').controller('StreamCtrl', function($scope, streamData, $state, CurrentContext, AlertService) {
  $scope.stream = streamData.stream;
  $scope.posts = streamData.posts;
  CurrentContext.context(stream.name);

  $scope.deleteStream = function() {
    $scope.stream.$remove(AlertService.handleResponse.info, AlertService.handleResponse.error);
  }
});