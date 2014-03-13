(function() {
  var app = angular.module('bs.models', ['ngResource']);

    app.run(function($rootScope, $window, Cacher, Bucket, Comment, Post, Stream, User, CurrentUserInfoService) {
      var cacheables = [
        { name: 'user', model: User },
        { name: 'stream', model: Stream },
        { name: 'bucket', model: Bucket },
        { name: 'post', model: Post },
        { name: 'comment', model: Comment }
      ];
      Cacher.initialize(cacheables);
      if (window.BS) {
        $window.BS.Cacher = Cacher;
        $window.BS.model = {
          Bucket: Bucket,
          Comment: Comment,
          Post: Post,
          Stream: Stream,
          User: User
        };
        $window.BS.CurrentUser = CurrentUserInfoService.getUser();
  
        $rootScope.$on(CurrentUserInfoService.events.user, function(event, updatedUser) {
          $window.BS.CurrentUser = updatedUser;
        });
      }
    });
})();