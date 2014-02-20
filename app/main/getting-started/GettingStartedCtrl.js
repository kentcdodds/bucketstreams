angular.module('bs.app').controller('GettingStartedCtrl', function($scope, $timeout, _, $upload, UtilService, CurrentUserService, AlertService, $http) {

  $scope.currentUser = CurrentUserService.getUser();
  $scope.$on(CurrentUserService.userUpdateEvent, function(event, updatedUser) {
    $scope.currentUser = updatedUser;
  });

  $scope.fieldsToFill = $scope.currentUser.getFieldsToFill();
  $scope.dismiss = function() {
    $scope.currentUser.setupReminderDate = new Date();
    $scope.currentUser.$save();
    $scope.$close();
  };

  $scope.toggleDontRemind = function($event, fieldDisplayName) {
    $scope.currentUser.toggleDontRemind(fieldDisplayName);
    $scope.currentUser.$save();

    if ($event.stopPropagation) $event.stopPropagation();
    if ($event.preventDefault) $event.preventDefault();
    $event.cancelBubble = true;
  };

  var checkUniqueUsername = function(username) {
    return $http.get('/api/v1/unique/user?field=username&value=' + username);
  };

  $scope.usernameStates = {
    invalid: false,
    usernameInUse: false,
    empty: true,
    wrongLength: false
  };

  var checkFilledInUsername = _.debounce(function(username) {
    checkUniqueUsername(username).then(function(result) {
      $scope.usernameStates.usernameInUse = !result.data.isUnique;
      var s = $scope.usernameStates;
      $scope.usernameStates.valid = !(s.invalid || s.usernameInUse || s.empty || s.wrongLength);
    });
  }, 400);

  var usernameLengthIssueFunction = null;
  function setUsernameWrongLength() {
    usernameLengthIssueFunction = $timeout(function() {
      $scope.usernameStates.wrongLength = true;
    }, 500);
  }

  function resetUsernameStates() {
    _.each($scope.usernameStates, function(val, prop) {
      $scope.usernameStates[prop] = false;
    });
  }

  $scope.onUsernameChange = function(username) {
    resetUsernameStates();
    $timeout.cancel(usernameLengthIssueFunction);
    if (_.isEmpty(username)) {
      $scope.usernameStates.empty = true;
      return;
    }
    var wrongLength = username.length < 3 || username.length > 16;

    if (wrongLength) {
      setUsernameWrongLength();
    }
    var valid = /^([a-zA-Z]|_|\d)*$/.test(username);
    if (!valid) {
      $scope.usernameStates.invalid = true;
    } else if (!wrongLength) {
      checkFilledInUsername(username);
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

  $scope.onFileSelect = function(file) {
    $scope.uploadInProgress = true;
    $scope.upload = $upload.upload({
      url: '/upload/image',
      method: 'POST',
      data: {
        type: 'profile',
        user: $scope.currentUser.username
      },
      file: file
    }).progress(function(event) {
      $scope.uploadProgress = parseInt(100.0 * event.loaded / event.total);
    }).success(function(data, status, headers, config) {
      $scope.uploadInProgress = false;
      AlertService.success('Saved');
    }).error(function(err) {
      $scope.uploadInProgress = false;
      AlertService.error('Error uploading file: ' + err.message || err);
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