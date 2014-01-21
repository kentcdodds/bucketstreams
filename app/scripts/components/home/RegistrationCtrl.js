angular.module('bsApp').controller('RegistrationCtrl', function ($scope, $http) {
  $scope.step = 1;
  $scope.userLeft = {
    username: false,
    email: false,
    password: false,
    passwordConfirm: false
  };
  $scope.userInfo = {
    email: '',
    password: ''
  };

  $scope.goBack = function() {
    console.log('going back');
    $scope.step = $scope.step - 1;
  };

  $scope.advance = function() {
    console.log('advancing');
    $scope.register($scope.userInfo.email, $scope.userInfo.password);
//    $scope.step = $scope.step + 1;
  };

  $scope.showError = function(name) {
    return $scope.usernameEmailForm[name].$dirty && $scope.usernameEmailForm[name].$valid && $scope.userLeft[name];
  };

  $scope.readyToContinue = function() {
    return true;
  };

  $scope.register = function(username, password) {
    $http({
      method: 'POST',
      url: '/register',
      data: {
        username: username,
        password: password
      }
    });
  };
});