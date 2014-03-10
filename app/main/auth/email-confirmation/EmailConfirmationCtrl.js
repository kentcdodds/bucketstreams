angular.module('bs.app').controller('EmailConfirmationCtrl', function($scope, result, code, $http, AlertService) {
  $scope.result = result;
  $scope.code = code;
  $scope.sendNewConfirmationEmail = function() {
    $http('/api/v1/auth/confirm-email/resend').then(function(response) {
      if (response.data.sent) {
        AlertService.success('Email sent to ' + $scope.currentUser.email);
      } else {
        AlertService.info(response.data.reason);
      }
    }, AlertService.handleResponse.error);
  };
});