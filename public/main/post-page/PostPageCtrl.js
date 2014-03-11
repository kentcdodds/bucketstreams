angular.module('bs.app').controller('PostPageCtrl', function($scope, post, $state) {
  $scope.post = post;
  $scope.onPostRemoved = function(post) {
    $state.go('root.route');
  }
});