angular.module('bs.frontPage').controller('LoginCtrl', function ($scope, User, $window, AlertService) {
  $scope.login = function(userInfo) {
    if (!userInfo || $scope.loginForm.$invalid) {
      return;
    }
    $scope.loggingIn = true;
    var promise = User.login(userInfo.username, userInfo.password);
    promise.success(function() {
      $window.location.href = '/';
    }).error(function(err) {
      $scope.loggingIn = false;
      AlertService.error('Please try again. There was a problem logging in: ' + err.message);
    });
  }
});