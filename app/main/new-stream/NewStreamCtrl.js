angular.module('bs.app').controller('NewStreamCtrl', function($scope, Stream, AlertService, currentUser) {
  $scope.stream = new Stream({
    owner: currentUser._id
  });

  $scope.onSubmit = function() {
    $scope.stream.$save(function() {
      AlertService.success('Awesome, created ' + $scope.stream.name);
      $scope.$close($scope.stream);
    }, AlertService.handleResponse.error);
  }
});