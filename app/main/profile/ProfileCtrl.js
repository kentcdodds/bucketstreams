angular.module('bs.app').controller('ProfileCtrl', function($scope, currentUser, profileUser, buckets, streams, CurrentUserService, CurrentContext, $upload, AlertService) {
  $scope.currentUser = currentUser;
  $scope.profileUser = profileUser;
  $scope.buckets = buckets;
  $scope.streams = streams;

  CurrentContext.context(profileUser.getDisplayName());

  $scope.onFileSelect = function(file) {
    $scope.uploadInProgress = true;
    $scope.upload = $upload.upload({
      url: '/upload/image',
      method: 'POST',
      data: {
        type: 'profile',
        name: $scope.photoName,
        user: $scope.currentUser.username
      },
      file: file
    }).progress(function(event) {
      $scope.uploadProgress = parseInt(100.0 * event.loaded / event.total);
    }).success(function(data, status, headers, config) {
      $scope.uploadInProgress = false;
      AlertService.success('Saved');
      CurrentUserService.refreshUser();
    }).error(function(err) {
      $scope.uploadInProgress = false;
      AlertService.error('Error uploading file: ' + err.message || err);
    });
  };

});