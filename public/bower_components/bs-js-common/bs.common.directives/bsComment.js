angular.module('bs.common.directives').directive('bsComment', function(CurrentUserInfoService) {
  return {
    restrict: 'A',
    templateUrl: 'templates/bsComment.html',
    replace: true,
    scope: {
      comment: '=bsComment',
      onDeleteClicked: '&'
    },
    link: function(scope, el) {
      scope.author = scope.comment.getAuthor();
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });

      scope.hovering = false;
      scope.canEdit = function() {
        return scope.author && scope.currentUser && scope.author._id === scope.currentUser._id;
      };

      scope.deleteComment = function() {
        if (scope.canEdit()) {
          scope.comment.$remove();
          scope.onDeleteClicked({comment: scope.comment});
        }
      };
      
      scope.edit = function() {
        scope.newCommentContent = scope.comment.content.textString;
        scope.editing = true;
      };
      
      scope.updateComment = function(newContent) {
        scope.comment.content.textString = newContent;
        scope.editing = false;
        scope.comment.$save();
      }
    }
  }
});