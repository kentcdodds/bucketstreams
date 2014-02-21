angular.module('bs.frontPage').controller('FrontPageCtrl', function ($scope, $http, $window, User, AlertService) {

  $scope.password = '';
  $scope.email = '';
  $scope.going = false;
  $scope.action = 'Login';

  $scope.login = function(input, password) {
    loginOrRegister('login', input, password);
  };

  $scope.signUp = function(input, password) {
    loginOrRegister('register', input, password);
  };

  function loginOrRegister(action, input, password) {
    $scope.going = true;
    var promise = User[action](input, password);

    promise.success(function() {
      $window.location.href = '/';
    });

    promise.error(function(err) {
      $scope.going = false;
      AlertService.error(err.message);
    });
  }

});
