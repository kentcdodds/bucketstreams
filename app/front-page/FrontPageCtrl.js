angular.module('bs.frontPage').controller('FrontPageCtrl', function ($scope, $http, $window, User, AlertService) {

  $scope.password = '';
  $scope.email = '';

  function resetFields() {
    $scope.emailIsUnique = false;
    $scope.usernameIsUnique = false;
    $scope.isValidEmail = false;
    $scope.isValidUsername = false;
  }

  resetFields();

  function updateActionType() {
    var isSignUp = $scope.emailIsUnique && $scope.isValidEmail;
    var isUsernameType = !$scope.usernameIsUnique && $scope.isValidUsername;
    var isLogin = isUsernameType || !$scope.emailIsUnique && $scope.isValidEmail;
    $scope.invalidInput = false;
    if (isLogin) {
      $scope.action = 'Login';
      $scope.invalidInput = $scope.password.length < 1;
    } else if (isSignUp) {
      $scope.action = 'Sign Up';
      $scope.invalidInput = $scope.password.length < 6;
    } else {
      $scope.invalidInput = true;
      $scope.action = 'Sign Up';
    }
  }
  updateActionType();

  var checkUsernameExists = _.debounce(function(username) {
    $http.get('/api/v1/unique/user?field=username&value=' + username).then(function(result) {
      $scope.usernameIsUnique = result.data.isUnique;
      updateActionType();
      console.log(username + ' is unique:', $scope.usernameIsUnique);
    });
  }, 100);

  var checkEmailExists = _.debounce(function(email) {
    $http.get('/api/v1/unique/user?field=email&value=' + email).then(function(result) {
      $scope.emailIsUnique = result.data.isUnique;
      updateActionType();
      console.log(email + ' is unique:', $scope.emailIsUnique);
    });
  }, 100);

  $scope.onInputChange = function(input, validEmail) {
    if (_.isEmpty(input) || input.length < 3) {
      resetFields();
      updateActionType();
      return;
    }
    $scope.isValidUsername = /^([a-zA-Z]|_|\d)*$/.test(input);
    $scope.isValidEmail = input.indexOf('@') > 0 && validEmail;
    console.log('email:', input, 'validEmail:', validEmail, 'validUsername:', $scope.isValidUsername);
    if (validEmail) {
      checkEmailExists(input);
    } else {
      checkUsernameExists(input);
    }
  };

  $scope.loginOrRegister = function(input, password) {
    var action;
    switch ($scope.action) {
      case 'Sign Up':
        $scope.registering = true;
        action = 'register';
        break;
      case 'Login':
        $scope.loggingIn = true;
        action = 'login';
        break;
      default:
        AlertService.error('An unknown error occurred. Please let us know.');
        return;
    }

    var promise = User[action](input, password);

    promise.success(function() {
      $window.location.href = '/';
    });

    promise.error(function(err) {
      $scope.registering = false;
      $scope.loggingIn = false;
      AlertService.error(err.message);
    });
  }

});
