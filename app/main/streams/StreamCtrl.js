angular.module('bs.app').controller('StreamCtrl', function($scope, stream, $state, CurrentContext, AlertService) {
  $scope.stream = stream;
  CurrentContext.context(stream.name);

  $scope.deleteStream = function() {
    $scope.stream.$remove(AlertService.handleResponse.info, AlertService.handleResponse.error);
  }
});