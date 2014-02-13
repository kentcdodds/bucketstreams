angular.module('bs.frontPage').controller('RegistrationCtrl', function ($scope, User, $window) {
  $scope.register = function(userInfo) {
    if ($scope.signUpForm.$invalid) {
      return;
    }
    $scope.registering = true;
    User.register(userInfo.email, userInfo.password).success(function() {
      $window.location.href = '/';
    }).error(function() {
      $scope.registering = false;
      $scope.errorRegistering = true;
    });
  };
});