angular.module('bs.app').controller('ResetPasswordCtrl', function($scope, user, code) {
  $scope.user = user;
  $scope.code = code;
  $scope.newPassword = '';
});