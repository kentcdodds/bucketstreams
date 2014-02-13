angular.module('bs.frontPage').controller('LoginCtrl', function ($scope, User, $window) {
  $scope.login = function() {
    var promise = User.login($scope.userInfo.username, $scope.userInfo.password);
    promise.success(function() {
      $window.location.href = '/';
    }).error(function() {
      $scope.errorLoggingIn =  true;
    });
  }
});