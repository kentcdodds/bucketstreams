angular.module('bs.app').controller('PostStreamPageCtrl', function($scope, $state, _, data, $modal, AlertService, CommonModalService, CurrentUserInfoService, PostBroadcaster) {
  $scope.thing = data.thing;
  $scope.posts = data.posts || [];
  $scope.type = data.type;
  $scope.isStream = data.type === 'stream';
  $scope.owner = data.owner;
  if ($scope.isStream) {
    $scope.stream = data.thing;
    $scope.subscriptionsInfo = data.subscriptionsInfo;
  } else {
    $scope.bucket = data.thing;
    var bucket = _.find($scope.userBuckets, {_id: $scope.thing._id});
    if (bucket && !bucket.isMain) {
      bucket.selected(true);
    }
  }
  if ($scope.isAuthenticated) { 
    $scope.currentUserIsOwner = $scope.currentUser && $scope.currentUser._id === $scope.thing.owner;
  }
  $scope.streams = CurrentUserInfoService.getStreams();
  $scope.editThing = function() {
    CommonModalService.createOrEditBucketStream($scope.type, $scope.thing).result.then(function(theThing) {
      if (theThing) {
        $scope.thing = theThing;
      }
    });
  };

  $scope.$on(PostBroadcaster.removedPostEvent, function(event, post) {
    _.remove($scope.posts, {_id: post._id});
  });

  $scope.$on(PostBroadcaster.newPostEvent, function(event, post) {
    if (_.contains(post.buckets, $scope.thing._id) || (!$scope.isStream && $scope.thing.isMain)) {
      $scope.posts.unshift(post);
    }
  });
  var subscriptionsInfo = ($scope.thing && $scope.thing.subscriptionsInfo) ? $scope.thing.subscriptionsInfo : {};
  $scope.subscriptionGroups = [
    {
      name: 'Buckets',
      type: 'bucket',
      list: subscriptionsInfo.buckets,
      icon: 'bitbucket'
    },
    {
      name: 'Streams',
      type: 'stream',
      list: subscriptionsInfo.streams,
      icons: 'smile-o'
    }
  ];
});