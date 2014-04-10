angular.module('bs.web.app').controller('ProfileCtrl', function($scope, profileUser, buckets, streams, mainBucketData) {
  $scope.profileUser = profileUser;
  $scope.buckets = buckets;
  $scope.streams = streams;
  $scope.mainBucketData = mainBucketData;
  $scope.postsAndShares = {
    posts: mainBucketData.posts || [],
    shares: mainBucketData.shares || []
  };
  $scope.displayName = profileUser.getDisplayName();
});