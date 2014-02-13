angular.module('bs.frontPage').controller('LoginCtrl', function ($scope, User, $window) {
  $scope.login = function() {
    if ($scope.loginForm.$invalid) {
      return;
    }
    $scope.loggingIn = true;
    var promise = User.login($scope.userInfo.username, $scope.userInfo.password);
    promise.success(function() {
      $window.location.href = '/';
    }).error(function() {
      $scope.loggingIn = false;
      $scope.errorLoggingIn =  true;
    });
  }
});