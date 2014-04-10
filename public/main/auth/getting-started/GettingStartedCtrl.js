angular.module('bs.web.app').controller('GettingStartedCtrl', function($scope, $timeout, _, $upload, UtilService, CurrentUserInfoService, AlertService) {
  $scope.currentUser = CurrentUserInfoService.getUser();
  $scope.validationParams = {
    email: $scope.currentUser.email
  };
  $scope.currentUser.name = $scope.currentUser.name || {};
  $scope.tempUserInfo = {
    username: $scope.currentUser.username,
    name: {
      first: $scope.currentUser.name.first,
      last: $scope.currentUser.name.last
    },
    tagline: $scope.currentUser.tagline
  };

  $scope.onSaveClicked = function() {
    _.extend($scope.currentUser, $scope.tempUserInfo);
    $scope.currentUser.$save(function() {
      AlertService.success('Saved');
      $scope.$close();
    }, function(err) {
      AlertService.error(err.message);
    });
  };

  $scope.onLogoutClicked = function() {
    $scope.currentUser.logout();
    $scope.currentUser = null;
    $scope.isAuthenticated = false;
    $state.go('root.anon', { reload: true, notify: true });
    AlertService.info('Thank you, come again!');
  };

});