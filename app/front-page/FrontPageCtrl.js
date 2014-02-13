angular.module('bs.frontPage').controller('FrontPageCtrl', function ($scope) {
  $scope.alert = {};
  $scope.setAlert = function(alert) {
    $scope.alert = alert;
  }
});
