(function() {
  var app = angular.module('bs.common.models', ['ngResource']);

  var baseUrl = '/';
  if (window.BS && window.BS.BASE_URL) {
    baseUrl = window.BS.BASE_URL;
  }

  app.constant('BaseUrl', baseUrl);

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

    // If we're on dev, then add a few things to the global BS object for debugging.
    if ($window.BS && $window.BS.onDev) {
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