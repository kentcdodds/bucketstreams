angular.module('bs.app').controller('MainCtrl', function($scope, _, $state, $window, $modal, $http, mainStreamData, Stream, Bucket, Post, CurrentUserInfoService, AlertService, CurrentContext) {
  $scope.mainStreamData = mainStreamData;
  
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
});