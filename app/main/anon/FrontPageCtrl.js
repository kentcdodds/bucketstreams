angular.module('bs.app').controller('FrontPageCtrl', function ($scope, $http, $window, $state, User, AlertService, _, CurrentUserInfoService) {

  $scope.password = '';
  $scope.email = '';
  $scope.going = false;
  $scope.action = 'Login';
  var rememberMeKey = 'front-page-remember-me';
  var rememberedUsername = localStorage.getItem(rememberMeKey);
  var remembered = !!rememberedUsername && !/null|undefined/.test(rememberedUsername);
  $scope.rememberMe = remembered;
  if (remembered) {
    $scope.username = rememberedUsername;
  }
  $scope.$watch('rememberMe + username', function() {
    if ($scope.rememberMe && $scope.username) {
      localStorage.setItem(rememberMeKey, $scope.username);
    } else {
      localStorage.removeItem(rememberMeKey);
    }
  });

  $scope.$watch('action', function(action) {
    if (action === 'Login') {
      if (_.isEmpty($scope.username) || !_.isEmpty($scope.loginPassword)) {
        $scope.focus = 'username';
      } else {
        $scope.focus = 'login-password';
      }
    } else {
      if (_.isEmpty($scope.email) || !_.isEmpty($scope.signUpPassword)) {
        $scope.focus = 'email';
      } else {
        $scope.focus = 'signup-password';
      }
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
      
      CurrentUserInfoService.refreshUser();
      CurrentUserInfoService.refreshBuckets();
      CurrentUserInfoService.refreshStreams();
      $state.go('root.auth');
    });

    promise.error(function(err) {
      $scope.going = false;
      AlertService.error(err.message);
    });
  }

});
