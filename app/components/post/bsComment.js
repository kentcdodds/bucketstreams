angular.module('bs.directives').directive('bsComment', function(CurrentUserService, User) {
  return {
    restrict: 'A',
    templateUrl: '/components/post/bsComment.html',
    replace: true,
    scope: {
      comment: '=bsComment',
      onDeleteClicked: '&'
    },
    link: function(scope, el) {
      if (scope.comment.author) {
        scope.author = User.get({id: scope.comment.author});
      }
      scope.currentUser = CurrentUserService.getUser();
      scope.$on(CurrentUserService.userUpdateEvent, function(event, user) {
        scope.currentUser = user;
      });

      scope.showDelete = false;
      scope.canDelete = function() {
        return scope.author && scope.author._id === scope.currentUser._id;
      };

      scope.deleteComment = function() {
        if (scope.canDelete()) {
          scope.comment.$remove();
          scope.onDeleteClicked({comment: scope.comment});
        }
      }
    }
  }
});