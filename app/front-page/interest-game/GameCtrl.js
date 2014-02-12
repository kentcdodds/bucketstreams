angular.module('bs.frontPage').controller('GameCtrl', function($scope, $window) {
  $scope.login = function(provider) {
    $window.location.href = '/auth/' + provider + '?visitor=true&destination=' + encodeURIComponent('/interest/' + provider);
  }
});