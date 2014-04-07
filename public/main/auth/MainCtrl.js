angular.module('bs.web.app').controller('MainCtrl', function($scope, _, $state, $window, $modal, $http, mainStreamData, Stream, Bucket, Post, User, Cacher, CurrentUserInfoService, CommonModalService, AlertService, CurrentContext, Recommendations) {
  if (!$scope.isAuthenticated) {
    return;
  }
  $scope.mainStreamData = mainStreamData;
  $scope.postsAndShares = {
    posts: mainStreamData.posts || [],
    shares: mainStreamData.shares || []
  };
  
  function maybeOpenGettingStartedModal() {
    if (!$scope.currentUser.hasUsername()) {
      CurrentContext.context('Getting Started');
      $modal.open({
        templateUrl: '/main/auth/getting-started/getting-started.html',
        controller: 'GettingStartedCtrl',
        backdrop: 'static',
        keyboard: false
      }).result.then(maybeOpenAModal);
      return true;
    }
  }

  function maybeOpenEmailConfirmationModal() {
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
      }).result.then(maybeOpenAModal);
      return true;
    }
  }

  function maybeOpenPicker(type) {
    if ($scope['user' + type + 's'].length < 2) {
      var question = 'What do you like to see';
      var sections = Recommendations.streams;
      var model = Stream;
      if (type === 'Bucket') {
        question = 'What do you like to share?';
        sections = Recommendations.buckets;
        model = Bucket;
      }
      CommonModalService.pickThings({
        question: question,
        sections: sections
      }).result.then(function(pickedThings) {
          _.each(pickedThings, function(thing) {
            model.save({
              owner: $scope.currentUser._id,
              name: thing.name
            });
          });

        });
      return true;
    }
  }

  function maybeOpenAModal() {
    if (!maybeOpenGettingStartedModal()) {
      if (!maybeOpenEmailConfirmationModal()) {
        if (!maybeOpenPicker('Bucket')) {
          maybeOpenPicker('Stream');
        }
      }
    }
  }

  maybeOpenAModal();

  $scope.$on('post.removed.success', function(event, post) {
    _.remove($scope.postsAndShares.posts, {_id: post._id});
  });

  $scope.$on('post.created.success', function(event, post) {
    $scope.postsAndShares.posts.unshift(post);
  });

  $scope.$on('share.removed.success', function(event, share) {
    _.remove($scope.postsAndShares.shares, {_id: share._id});
  });

  $scope.$on('share.created.success', function(event, share) {
    $scope.postsAndShares.shares.unshift(share);
  });

  $scope.people = User.dicsoverUsers();
});