angular.module('bs.web.app').controller('ResetPasswordCtrl', function($scope, data, code, $http, $state, AlertService, UtilService) {
  $scope.user = data.user;
  $scope.result = data.result;
  $scope.code = code;
  $scope.loading = false;
  $scope.sendNewResetPasswordEmail = function(username) {
    $scope.loading = true;
    UtilService.sendResetPasswordEmail(username).then(function() {
      AlertService.success('An email has been sent.');
    }, function() {
      AlertService.error('There was a problem. Please try again');
    }).finally(function() {
      $scope.loading = false;
    });
  };
  $scope.onSubmit = function(newPassword) {
    $http({
      method: 'POST',
      url: '/api/v1/auth/reset-password/' + $scope.code,
      data: {
        newPassword: newPassword
      }
    }).then(function() {
      AlertService.success('Password changed!');
      $state.go('root.auth.home');
    }, function() {
      AlertService.error('There was a problem. Please try again');
    }).finally(function() {
      $scope.loading = false;
    });
  }
});