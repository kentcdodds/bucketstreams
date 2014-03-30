angular.module('bs.app').controller('MainCtrl', function($scope, _, $state, $window, $modal, $http, mainStreamData, Stream, Bucket, Post, User, Cacher, CurrentUserInfoService, CommonModalService, AlertService, CurrentContext, PostBroadcaster, ShareBroadcaster) {
  if (!$scope.isAuthenticated) {
    return;
  }
  $scope.mainStreamData = mainStreamData;
  $scope.postsAndShares = {
    posts: mainStreamData.posts || [],
    shares: mainStreamData.shares || []
  };
  
  if (!$scope.currentUser.hasUsername()) {
    CurrentContext.context('Getting Started');
    $modal.open({
      templateUrl: '/main/auth/getting-started/getting-started.html',
      controller: 'GettingStartedCtrl',
      backdrop: 'static',
      keyboard: false
    }).result.then(function() {
        $window.location.href = '/';
      });
    return;
  }
  
  if (!$scope.currentUser.isConfirmed() && $state.current.name !== 'root.emailConfirmation') {
    CurrentContext.context('Email Confirmation');
    var currentUser = $scope.currentUser;
    $modal.open({
      controller: function($scope, $http) {
        $scope.currentUser = currentUser;
        $scope.sendNewConfirmationEmail = function() {
          $http.post('/api/v1/auth/confirm-email/resend').then(function(response) {
            if (response.data.sent) {
              AlertService.success('Email sent to ' + currentUser.email);
            } else {
              AlertService.info(response.data.reason);
            }
          }, AlertService.handleResponse.error);
        }
      },
      templateUrl: '/main/auth/email-confirmation/need-confirmation.html',
      backdrop: 'static',
      keyboard: false
    });
  }

  $scope.$on(PostBroadcaster.removedPostEvent, function(event, post) {
    _.remove($scope.postsAndShares.posts, {_id: post._id});
  });

  $scope.$on(PostBroadcaster.newPostEvent, function(event, post) {
    $scope.postsAndShares.posts.unshift(post);
  });

  $scope.$on(ShareBroadcaster.removedShareEvent, function(event, share) {
    _.remove($scope.postsAndShares.shares, {_id: share._id});
  });

  $scope.$on(ShareBroadcaster.newShareEvent, function(event, share) {
    $scope.postsAndShares.shares.unshift(share);
  });
  
  $scope.people = User.dicsoverUsers();

  $scope.onShare = CommonModalService.sharePost;
});