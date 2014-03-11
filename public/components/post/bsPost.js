angular.module('bs.directives').directive('bsPost', function(CurrentUserInfoService, User, Comment) {
  return {
    restrict: 'A',
    templateUrl: '/components/post/bsPost.html',
    replace: true,
    scope: {
      post: '=bsPost',
      onRemoved: '&'
    },
    link: function(scope, el) {
      scope.author = scope.post.authorInfo;// || User.get({id: scope.post.author});
      scope.comments = scope.post.comments;// || Comment.query({owningPost: scope.post._id});
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });

      scope.removePost = function() {
        scope.post.$remove();
        scope.onRemoved();
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
        comment.$save();
        addComment(comment);
        scope.commentToAdd = '';
      };

      function removeComment(comment) {
        scope.comments = scope.comments || [];
        var index = scope.comments.indexOf(comment);
        if (index > -1) {
          scope.comments.splice(index, 1);
        }
      }

      function addComment(comment) {
        scope.comments = scope.comments || [];
        scope.comments.push(comment);
      }

      scope.showOrHideComment = function(comment) {
        comment.showDelete = comment.author.username === scope.currentUser.username;
      };

      scope.deleteComment = function(comment) {
        removeComment(comment);
      }
    }
  }
});