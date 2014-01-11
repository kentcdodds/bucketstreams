angular.module('bucketstreamsApp').controller('LoginCtrl', function ($scope) {
  $scope.login = function() {
    console.log('loggin in with ', $scope.userInfo);
  }
});