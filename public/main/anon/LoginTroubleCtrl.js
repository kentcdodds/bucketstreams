angular.module('bs.web.app').controller('LoginTroubleCtrl', function($scope, $http, AlertService, UtilService) {
  $scope.loading = false;
  $scope.onSubmit = function(username) {
    $scope.loading = true;
    UtilService.sendResetPasswordEmail(username).then(function() {
      AlertService.success('An email has been sent. Good luck!');
    }, function() {
      AlertService.error('There was a problem... Please try again...');
    }).finally(function() {
      $scope.loading = false;
    });
  }
});