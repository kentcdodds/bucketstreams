(function() {
  var app = angular.module('bs.common.models', ['ngResource']);

  app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });

  app.run(function($rootScope, $window, Cacher, Bucket, Comment, Post, Share, Stream, User, CurrentUserInfoService) {
    var cacheables = [
      { name: 'user', model: User },
      { name: 'stream', model: Stream },
      { name: 'bucket', model: Bucket },
      { name: 'post', model: Post },
      { name: 'share', model: Share },
      { name: 'comment', model: Comment }
    ];
    Cacher.initialize(cacheables);

    // If we're on dev, then we'll have the BS object so add a few thing to the global BS object for debugging.
    if ($window.BS) {
      $window.BS.Cacher = Cacher;
      $window.BS.model = {
        Bucket: Bucket,
        Comment: Comment,
        Post: Post,
        Share: Share,
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