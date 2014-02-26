angular.module('bs.app').controller('BucketCtrl', function($scope, bucket, AlertService, CurrentContext) {
  $scope.bucket = bucket;
  CurrentContext.context(bucket.name);

  $scope.deleteBucket = function() {
    $scope.bucket.$remove(AlertService.handleResponse.info, AlertService.handleResponse.error);
  }
});