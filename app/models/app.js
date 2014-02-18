(function() {
  var app = angular.module('bs.models', ['ngResource', 'pasvaz.bindonce']);

  if (window.BS) {
    app.run(function($rootScope, $window, Bucket, Comment, Post, Stream, User, CurrentUserService) {
      $window.BS.model = {
        Bucket: Bucket,
        Comment: Comment,
        Post: Post,
        Stream: Stream,
        User: User
      };
      $window.BS.CurrentUser = CurrentUserService.getUser();

      $rootScope.$on(CurrentUserService.userUpdateEvent, function(event, updatedUser) {
        $rootScope.currentUser = updatedUser;
      });

    });
  }
})();