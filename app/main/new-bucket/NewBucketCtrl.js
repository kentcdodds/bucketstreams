angular.module('bs.app').controller('NewBucketCtrl', function($scope, Bucket, AlertService, currentUser) {
  $scope.bucket = new Bucket({
    owner: currentUser._id
  });

  $scope.onSubmit = function() {
    $scope.bucket.$save(function() {
      AlertService.success('Awesome, created ' + $scope.bucket.name);
      $scope.$close($scope.bucket);
    }, AlertService.handleErrorResponse);
  }
});