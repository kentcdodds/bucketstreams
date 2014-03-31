angular.module('bs.web.app').controller('PostPageCtrl', function($scope, post, $state) {
  $scope.post = post;
  $scope.onPostRemoved = function(post) {
    $state.go('root.auth.home');
  }
});