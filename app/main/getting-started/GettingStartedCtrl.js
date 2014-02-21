angular.module('bs.app').controller('GettingStartedCtrl', function($scope, $timeout, _, $upload, UtilService, CurrentUserService, AlertService) {

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

  $scope.form = null;

  $scope.onSaveClicked = function(validUsername, username, firstName, lastName) {
    var valid = validUsername && firstName && lastName;
    if (valid) {
      $scope.currentUser.username = username;
      $scope.currentUser.name = $scope.currentUser.name || {};
      $scope.currentUser.name.first = firstName;
      $scope.currentUser.name.last = lastName;
      saveUser();
    }
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
    return $scope.currentUser.$save(function() {
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