angular.module('bs.app').controller('GettingStartedCtrl', function($scope, $timeout, _, $upload, UtilService, CurrentUserInfoService, AlertService) {

  $scope.currentUser = CurrentUserInfoService.getUser();
  $scope.$on(CurrentUserInfoService.events.user, function(event, updatedUser) {
    $scope.currentUser = updatedUser;
  });
  $scope.validationParams = {
    email: $scope.currentUser.email
  };
  $scope.currentUser.name = $scope.currentUser.name || {};
  $scope.firstName = $scope.currentUser.name.first;
  $scope.lastName = $scope.currentUser.name.last;
  $scope.tempUsername = $scope.currentUser.username;

  $scope.fieldsToFill = $scope.currentUser.getFieldsToFill();
  $scope.dismiss = function() {
    $scope.currentUser.extraInfo.setupReminderDate = new Date();
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
    if (!valid) return;

    $scope.currentUser.username = username;
    $scope.currentUser.name = $scope.currentUser.name || {};
    $scope.currentUser.name.first = firstName;
    $scope.currentUser.name.last = lastName;
    $scope.currentUser.$save(function() {
      AlertService.success('Saved');
      $scope.$close();
    }, function(err) {
      AlertService.error('Error Saving: ' + err.message);
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
});