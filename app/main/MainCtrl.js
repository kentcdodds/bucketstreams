angular.module('bs.app').controller('MainCtrl', function($scope, $http, $window) {
  $scope.greeting = 'Hello World!';
  $scope.logout = function() {
    $window.location.href = '/auth/logout';
  }
});