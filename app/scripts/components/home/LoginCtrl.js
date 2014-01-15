angular.module('bsApp').controller('LoginCtrl', function ($scope) {
  $scope.login = function() {
    console.log('loggin in with ', $scope.userInfo);
  }
});