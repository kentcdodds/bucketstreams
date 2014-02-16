angular.module('bs.app').controller('GettingStartedCtrl', function($scope, $timeout, _, UtilService, CurrentUser, AlertService, $http) {
  $scope.currentUser = CurrentUser;
  $scope.fieldsToFill = $scope.currentUser.getFieldsToFill();
  $scope.dismiss = function() {
    $scope.currentUser.setupReminderDate = new Date();
    $scope.currentUser.$save();
    $scope.$close();
  };

  $scope.dontRemind = function($event, fieldDisplayName) {
    $scope.currentUser.toggleDontRemind(fieldDisplayName)
    $scope.currentUser.$save();

    if ($event.stopPropagation) $event.stopPropagation();
    if ($event.preventDefault) $event.preventDefault();
    $event.cancelBubble = true;
  };

  var checkUniqueUsername = function(username) {
    return $http.get('/api/v1/util/username-unique?username=' + username);
  };

  $scope.usernameStates = {
    valid: false,
    invalid: false,
    usernameInUse: false,
    empty: true,
    tooShort: false
  };

  var checkFilledInUsername = _.debounce(function(valid, username) {
    $scope.usernameStates.invalid = !valid;
    if (valid) {
      checkUniqueUsername(username).then(function(result) {
        $scope.usernameStates.valid = result.data.isUnique;
        $scope.usernameStates.usernameInUse = !result.data.isUnique;
      });
    }
  }, 250);

  var usernameShortFunction = null;
  function setUsernameTooShort() {
    usernameShortFunction = $timeout(function() {
      $scope.usernameStates.tooShort = true;
    }, 500);
  }

  function resetUsernameStates() {
    _.each($scope.usernameStates, function(val, prop) {
      $scope.usernameStates[prop] = false;
    });
  }

  $scope.onUsernameChange = function(valid, username) {
    resetUsernameStates();
    $timeout.cancel(usernameShortFunction);
    if (!valid) {
      $scope.usernameStates.invalid = true;
    } else if (_.isEmpty(username)) {
      $scope.usernameStates.empty = true;
    } else if (username.length > 2) {
      checkFilledInUsername(valid, username);
    } else {
      setUsernameTooShort();
    }
  };

  $scope.saveUsername = function(username) {
    checkUniqueUsername(username).then(function(result) {
      $scope.usernameStates.valid = result.data.isUnique;
      if ($scope.usernameStates.valid) {
        $scope.currentUser.username = username;
        saveUser();
      }
    });
  };

  var saveUser = function() {
    $scope.currentUser.$save(function() {
      AlertService.success('Saved');
    }, function(err) {
      AlertService.error('Error Saving: ' + err.message);
    });
  };

  $scope.onFormUpdate = _.debounce(function(form) {
    if (!form.$invalid) {
      saveUser();
    }
  }, 1000);
});