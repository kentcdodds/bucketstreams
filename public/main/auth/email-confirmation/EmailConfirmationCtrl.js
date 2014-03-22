angular.module('bs.app').controller('EmailConfirmationCtrl', function($scope, result, code, $http, AlertService) {
  $scope.result = result;
  $scope.code = code;
  $scope.showSendAgainLink = result.type !== 'success' && result.type !== 'already-confirmed' && (result.type !== 'invalid-link' && !$scope.currentUser);
  $scope.sendNewConfirmationEmail = function() {
    var data;
    if ($scope.currentUser) {
      data = {
        email: $scope.currentUser.email
      }
    }
    $http.post('/api/v1/auth/confirm-email/resend', {
      data: data
    }).then(function(response) {
      if (response.data.sent) {
        AlertService.success('Email sent to ' + $scope.currentUser.email);
      } else {
        AlertService.info(response.data.reason);
      }
    }, AlertService.handleResponse.error);
  };
});