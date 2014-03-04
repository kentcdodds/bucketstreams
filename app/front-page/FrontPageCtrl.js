angular.module('bs.frontPage').controller('FrontPageCtrl', function ($scope, $http, $window, User, AlertService, _) {

  $scope.password = '';
  $scope.email = '';
  $scope.going = false;
  $scope.action = 'Login';
  var rememberMeKey = 'front-page-remember-me';
  var rememberedUsername = localStorage.getItem(rememberMeKey);
  $scope.rememberMe = !!rememberedUsername && !/null|undefined/.test(rememberedUsername);
  if ($scope.rememberMe) {
    $scope.username = rememberedUsername;
  }
  $scope.$watch('rememberMe + username', function() {
    if ($scope.rememberMe && $scope.username) {
      localStorage.setItem(rememberMeKey, $scope.username);
    } else {
      localStorage.removeItem(rememberMeKey);
    }
  });


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
