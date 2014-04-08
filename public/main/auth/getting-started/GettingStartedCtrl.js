angular.module('bs.web.app').controller('GettingStartedCtrl', function($scope, $timeout, _, $upload, UtilService, CurrentUserInfoService, AlertService) {

  $scope.currentUser = CurrentUserInfoService.getUser();
  $scope.$on(CurrentUserInfoService.events.user, function(event, updatedUser) {
    $scope.currentUser = updatedUser;
  });
  $scope.validationParams = {
    email: $scope.currentUser.email
  };
  $scope.currentUser.name = $scope.currentUser.name || {};
  $scope.tempUserInfo = { name: {} };
  $scope.tempUserInfo.username = $scope.currentUser.username;
  $scope.tempUserInfo.name.first = $scope.currentUser.name.first;
  $scope.tempUserInfo.name.last = $scope.currentUser.name.last;
  $scope.tempUserInfo.tagline = $scope.currentUser.tagline;

  $scope.fieldsToFill = $scope.currentUser.getFieldsToFill();
  $scope.dismiss = function() {
    $scope.currentUser.extraInfo.setupReminderDate = new Date();
    $scope.currentUser.$save();
    $scope.$close();
  };

  $scope.onSaveClicked = function() {
    _.extend($scope.currentUser, $scope.tempUserInfo);
    $scope.currentUser.$save(function() {
      AlertService.success('Saved');
      $scope.$close();
    }, function(err) {
      AlertService.error(err.message);
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