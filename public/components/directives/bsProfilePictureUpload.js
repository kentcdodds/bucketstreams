angular.module('bs.web.directives').directive('bsProfilePictureUpload', function(CurrentUserInfoService, $timeout, $upload, AlertService, $state) {
  return {
    restrict: 'E',
    templateUrl: 'templates/bsProfilePictureUpload.html',
    scope: {},
    link: function(scope, el, attrs) {
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });

      var width = el.parent()[0].offsetWidth;
      var newImageEl = angular.element(el.find('img')[1]);
      var newImageElWrapper = newImageEl.parent();
      newImageElWrapper.css('width', width + 'px');
      newImageElWrapper.css('margin-left', '-' + (width / 2) + 'px');

      scope.uploadInProgress = false;
      scope.onFileSelect = function(image) {
        scope.uploadInProgress = true;
        scope.uploadProgress = 0;
        scope.fileBeingUploaded = image;
        scope.error = null;

        if (angular.isArray(image)) {
          image = image[0];
        }

        scope.upload = $upload.upload({
          url: '/api/v1/upload/image',
          method: 'POST',
          data: {
            type: 'profile'
          },
          file: image
        }).progress(function(event) {
          scope.uploadProgress = Math.floor(event.loaded / event.total);
          console.log('progress', scope.uploadProgress);
          scope.$apply();
        }).success(function(data, status, headers, config) {
          scope.uploadInProgress = false;
          CurrentUserInfoService.refreshUser();
          $state.go($state.$current, null, { reload: true });
        }).error(function(err) {
          scope.uploadInProgress = false;
          scope.error = err;
          AlertService.error('Error uploading file: ' + err.message || err);
        });
      };
    }
  }
});