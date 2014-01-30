angular.module('bs.frontPage').controller('LoginCtrl', function ($scope, $http, $window) {
  $scope.login = function() {
    console.log('logging in with ', $scope.userInfo);
    $http({
      method: 'POST',
      url: '/login',
      data: {
        username: $scope.userInfo.username,
        password: $scope.userInfo.password
      }
    }).success(function() {
      $window.location.href = '/';
    });
  }
});