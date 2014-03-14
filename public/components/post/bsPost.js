angular.module('bs.directives').directive('bsPost', function(CurrentUserInfoService, _, Cacher, User, Comment, Share, PostBroadcaster, AlertService) {
  return {
    restrict: 'A',
    templateUrl: '/components/post/bsPost.html',
    replace: true,
    scope: {
      post: '=bsPost',
      onShare: '&',
      share: '='
    },
    link: function(scope, el) {
      scope.isShare = !!scope.share;
      scope.author = scope.post.getAuthor();
      scope.comments = scope.post.getComments();
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });
      
      scope.canEdit = scope.currentUser._id === scope.author._id;
      if (scope.isShare) {
        scope.shareAuthor = scope.share.getAuthor();
        scope.canEdit = scope.currentUser._id === scope.shareAuthor._id;
        
      }

      scope.removePost = function() {
        PostBroadcaster.broadcastRemovedPost(scope.post);
        scope.post.$remove(function() {
          AlertService.info('Post removed');
        }, function(err) {
          PostBroadcaster.broadcastNewPost(scope.post);
          AlertService.error(err.message);
        });
      };
      
      scope.share = function() {
        scope.onShare({post: scope.post});
      };
      
      scope.favorite = function() {
        scope.post.addFavorite(scope.currentUser);
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
        scope.scrollComments = true;
        scope.commentToAdd = '';
      };
      

      scope.showOrHideComment = function(comment) {
        comment.showDelete = comment.author.username === scope.currentUser.username;
      };
      
      scope.edit = function() {
        scope.newPostContent = scope.post.content.textString;
        scope.editing = true;
      };
      
      
      scope.updatePostContent = function(newContent) {
        scope.post.content.textString = newContent;
        scope.post.$save();
        scope.editing = false;
      };

      scope.deleteComment = function(comment) {
        _.remove(scope.comments, comment);
      };
      scope.scrollComments = true;
    }
  }
});