angular.module('bs.app').controller('PostStreamPageCtrl', function($scope, data) {
  $scope[data.type] = data[data.type];
  $scope.posts = data.posts;
  $scope.type = data.type;
});