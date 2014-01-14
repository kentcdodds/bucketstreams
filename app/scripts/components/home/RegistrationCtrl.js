angular.module('bucketstreamsApp').controller('RegistrationCtrl', function ($scope) {
  $scope.step = 1;
  $scope.userLeft = {
    username: false,
    email: false,
    password: false,
    passwordConfirm: false
  };

  $scope.goBack = function() {
    console.log('going back');
    $scope.step = $scope.step - 1;
  }

  $scope.advance = function() {
    console.log('advancing');
    $scope.step = $scope.step + 1;
  };

  $scope.showError = function(name) {
    return $scope.usernameEmailForm[name].$dirty && $scope.usernameEmailForm[name].$valid && $scope.userLeft[name];
  }

  $scope.readyToContinue = function() {
    return true;
  }
});