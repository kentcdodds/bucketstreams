angular.module('bs.app').controller('MainCtrl', function($scope, $http, $window, CurrentUser) {
  $scope.currentUser = CurrentUser;
  $scope.signOut = function() {
    $window.location.href = '/auth/logout';
  }
});