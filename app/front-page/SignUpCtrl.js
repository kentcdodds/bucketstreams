angular.module('bs.frontPage').controller('SignUpCtrl', function ($scope, User, $window, AlertService) {
  $scope.register = function(userInfo) {
    if ($scope.signUpForm.$invalid) {
      return;
    }
    $scope.registering = true;
    User.register(userInfo.email, userInfo.password).success(function() {
      $window.location.href = '/';
    }).error(function(err) {
      $scope.registering = false;
      AlertService.error(err.message);
    });
  };
});