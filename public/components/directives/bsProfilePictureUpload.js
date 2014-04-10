angular.module('bs.web.directives').directive('bsProfilePictureUpload', function(CurrentUserInfoService, CommonModalService) {
  return {
    restrict: 'E',
    templateUrl: 'templates/bsProfilePictureUpload.html',
    scope: {},
    link: function(scope) {
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });

      scope.openPhotoChooser = function() {
        CommonModalService.openPhotoChooser(scope.currentUser).result.then(function(result) {

        });
      };
    }
  }
});