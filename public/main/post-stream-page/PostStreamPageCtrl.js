angular.module('bs.web.app').controller('PostStreamPageCtrl', function($scope, $state, _, data, $modal, Cacher, AlertService, CommonModalService, CurrentUserInfoService, PostBroadcaster, ShareBroadcaster) {
  $scope.thing = data.thing;
  $scope.postsAndShares = {
    posts: data.posts || [],
    shares: data.shares || []
  };
  $scope.type = data.type;
  $scope.isStream = data.type === 'stream';
  $scope.owner = data.thing.getOwner();
  if ($scope.isStream) {
    $scope.stream = data.thing;
    $scope.subscriptionGroups = [
      {
        name: 'Buckets',
        type: 'bucket',
        list: $scope.thing.getBucketSubscriptions(),
        icon: 'bitbucket'
      },
      {
        name: 'Streams',
        type: 'stream',
        list: $scope.thing.getStreamSubscriptions(),
        icon: 'smile-o'
      }
    ];
  } else {
    $scope.bucket = data.thing;
    var bucket = _.find($scope.userBuckets, {_id: $scope.thing._id});
    if (bucket && !bucket.isMain) {
      bucket.selected(true);
    }
  }
  if ($scope.isAuthenticated) { 
    $scope.currentUserIsOwner = $scope.currentUser && $scope.currentUser._id === $scope.thing.owner;
    $scope.streams = CurrentUserInfoService.getStreams();
    $scope.editThing = function() {
      CommonModalService.createOrEditBucketStream($scope.type, $scope.thing).result.then(function(theThing) {
        if (theThing) {
          $scope.thing = theThing;
        }
      });
    };
  }

  $scope.$on(PostBroadcaster.removedPostEvent, function(event, post) {
    _.remove($scope.postsAndShares.posts, {_id: post._id});
  });

  $scope.$on(PostBroadcaster.newPostEvent, function(event, post) {
    if (_.contains(post.buckets, $scope.thing._id) || (!$scope.isStream && $scope.thing.isMain)) {
      $scope.postsAndShares.posts.unshift(post);
    }
  });

  $scope.$on(ShareBroadcaster.removedShareEvent, function(event, share) {
    _.remove($scope.postsAndShares.shares, {_id: share._id});
  });

  $scope.$on(ShareBroadcaster.newShareEvent, function(event, share) {
    if (_.contains(share.getPost().buckets, $scope.thing._id) || (!$scope.isStream && $scope.thing.isMain)) {
      $scope.postsAndShares.shares.unshift(share);
    }
  });
  
  $scope.onShare = CommonModalService.sharePost;
});