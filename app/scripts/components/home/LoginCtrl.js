angular.module('bsApp').controller('LoginCtrl', function ($scope, $http) {
  $scope.login = function() {
    console.log('logging in with ', $scope.userInfo);
    $http({
      method: 'POST',
      url: '/login',
      data: {
        username: $scope.userInfo.username,
        password: $scope.userInfo.password
      }
    });
  }
});