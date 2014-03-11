angular.module('bs.directives').directive('bsComment', function(CurrentUserInfoService, User) {
  return {
    restrict: 'A',
    templateUrl: '/components/post/bsComment.html',
    replace: true,
    scope: {
      comment: '=bsComment',
      onDeleteClicked: '&'
    },
    link: function(scope, el) {
      scope.author = scope.comment.authorInfo || User.get({id: scope.comment.author});
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });

      scope.hovering = false;
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