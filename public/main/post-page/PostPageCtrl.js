angular.module('bs.web.app').controller('PostPageCtrl', function($scope, post, $state) {
  $scope.bsPost = {
    post: post
  };
  $scope.onPostRemoved = function(post) {
    $state.go('root.auth.home');
  }
});