(function() {
  var app = angular.module('bs.models', ['ngResource', 'pasvaz.bindonce']);

  if (window.BS) {
    app.run(function($window, Bucket, Comment, Post, Stream, User, CurrentUser) {
      $window.BS.model = {
        Bucket: Bucket,
        Comment: Comment,
        Post: Post,
        Stream: Stream,
        User: User,
      };
      $window.BS.CurrentUser = CurrentUser;
    });
  }
})();