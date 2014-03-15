angular.module('bs.directives').directive('bsPost', function(CurrentUserInfoService, _, $q, Cacher, User, Comment, Share, PostBroadcaster, ShareBroadcaster, AlertService, CommonModalService) {
  return {
    restrict: 'A',
    templateUrl: '/components/post/bsPost.html',
    replace: true,
    scope: {
      post: '=bsPost',
      share: '=?',
      postOnly: '@'
    },
    link: function(scope, el) {
      scope.author = scope.post.getAuthor();
      scope.comments = scope.post.getComments();
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });
      var promises = [];
      _.each([scope.post, scope.share, scope.author, scope.comments, scope.currentUser], function(resource) {
        resource && resource.$promise && !resource.$resolved && promises.push(resource.$promise);
      });
      
      $q.all(promises).then(initializeScope);
      
      function initializeScope() {
        scope.isShare = !!scope.share;
        scope.canEdit = scope.currentUser._id === scope.author._id;
        scope.mainContent = scope.post.content.textString;
        scope.canDelete = scope.canEdit;
        scope.postBucketList = scope.post.getBuckets();
        scope.scrollComments = true;
        scope.authorDisplayName = scope.author.getDisplayName();

        if (scope.isShare) {
          scope.shareAuthor = scope.share.getAuthor();
          scope.shareAuthorDisplayName = scope.shareAuthor.getDisplayName();
          scope.canEdit = scope.currentUser._id === scope.shareAuthor._id;
          scope.shareBucketList = scope.share.getBuckets();
          scope.mainContent = scope.share.comments;
        }
      }

      scope.edit = function() {
        scope.newContent = scope.mainContent;
        scope.editing = true;
      };

      scope.updatePostContent = function(newContent) {
        if (scope.isShare) {
          scope.share.comments = newContent;
          scope.share.$save();
        } else {
          scope.post.content.textString = newContent;
          scope.post.$save();
        }
        scope.mainContent = newContent;
        scope.editing = false;
      };

      scope.deleteComment = function(comment) {
        _.remove(scope.comments, comment);
      };

      scope.removePost = function() {
        if (scope.isShare) {
          ShareBroadcaster.broadcastRemovedShare(scope.share);
          scope.share.$remove(function() {
            AlertService.info('Post removed');
          }, function(err) {
            ShareBroadcaster.broadcastNewShare(scope.share);
            AlertService.error(err.message);
          });
        } else {
          PostBroadcaster.broadcastRemovedPost(scope.post);
          scope.post.$remove(function() {
            AlertService.info('Post removed');
          }, function(err) {
            PostBroadcaster.broadcastNewPost(scope.post);
            AlertService.error(err.message);
          });
        }
      };

      scope.sharePost = function() {
        CommonModalService.sharePost(scope.post);
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

    }
  }
});