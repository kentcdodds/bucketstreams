angular.module('bs.app').controller('MainCtrl', function($scope, _, $state, $window, $modal, $http, currentUser, userBuckets, userStreams, Stream, Bucket, Post, CurrentUserInfoService, AlertService, CurrentContext, CommonModalService, UtilService, genie, bsGenie) {
  $scope.currentUser = currentUser;
  $scope.userBuckets = userBuckets;
  $scope.userStreams = userStreams;
  if (!$scope.currentUser.hasUsername()) {
    CurrentContext.context('Getting Started');
    $modal.open({
      templateUrl: '/main/getting-started/getting-started.html',
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
      templateUrl: '/main/email-confirmation/need-confirmation.html',
      backdrop: 'static',
      keyboard: false
    });
  }

});