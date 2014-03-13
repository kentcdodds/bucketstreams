angular.module('bs.directives').directive('bsPost', function(CurrentUserInfoService, _, Cacher, User, Comment, PostBroadcaster, AlertService) {
  return {
    restrict: 'A',
    templateUrl: '/components/post/bsPost.html',
    replace: true,
    scope: {
      post: '=bsPost'
    },
    link: function(scope, el) {
      scope.author = scope.post.getAuthor();
      scope.comments = scope.post.getComments();
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });

      scope.removePost = function() {
        PostBroadcaster.broadcastRemovedPost(scope.post);
        scope.post.$remove(function() {
          AlertService.info('Post removed');
        }, function(err) {
          PostBroadcaster.broadcastNewPost(scope.post);
          AlertService.error(err.message);
        });
      };

      scope.commentToAdd = '';
      scope.addComment = function(event) {
        if (event.keyCode != 13) return;
        var comment = new Comment({
          author: scope.currentUser._id,
          content: scope.commentToAdd,
          modified: new Date(),
          owningPost: scope.post._id
        });
        comment.$save(function(){
          Cacher.commentCache.putById(comment);
        }, function error() {
          scope.deleteComment(comment);
        });
        scope.comments = scope.comments || [];
        scope.comments.push(comment);
        scope.commentToAdd = '';
      };

      scope.showOrHideComment = function(comment) {
        comment.showDelete = comment.author.username === scope.currentUser.username;
      };

      scope.deleteComment = function(comment) {
        _.remove(scope.comments, comment);
      }
    }
  }
});