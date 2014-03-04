angular.module('bs.app').controller('ProfileCtrl', function($scope, profileUser, buckets, streams, UtilService, Bucket) {
  $scope.profileUser = profileUser;
  $scope.buckets = buckets;
  $scope.streams = streams;
  UtilService.loadData('bucket', profileUser.username, 'Main Bucket', Bucket).then(function(data) {
    $scope.mainBucketData = data;
  });

});