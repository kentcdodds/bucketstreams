angular.module('bs.app').controller('ProfileCtrl', function($scope, profileUser, buckets, streams, mainBucketData, CommonModalService) {
  $scope.profileUser = profileUser;
  $scope.buckets = buckets;
  $scope.streams = streams;
  $scope.mainBucketData = mainBucketData;
  $scope.postsAndShares = {
    posts: mainBucketData.posts || [],
    shares: mainBucketData.shares || []
  };
  $scope.onShare = CommonModalService.sharePost;
});