angular.module('bs.web.directives').directive('bsPost', function(CurrentUserInfoService, _, $q, Cacher, User, Comment, Share, PostBroadcaster, ShareBroadcaster, AlertService, CommonModalService, UtilFunctions) {
  return {
    restrict: 'A',
    templateUrl: '/components/directives/post/bsPost.html',
    replace: true,
    scope: {
      post: '=bsPost',
      share: '=?',
      postOnly: '@'
    },
    link: function(scope, el) {
      scope.isShare = !!scope.share;
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
      });
      var initialPromises = UtilFunctions.getResourcePromises([scope.post, scope.share, scope.currentUser]);
      $q.all(initialPromises).then(initializeStep1);

      function initializeStep1() {
        scope.mainContent = scope.post.content.textString;
        scope.author = scope.post.getAuthor();
        scope.comments = scope.post.getComments();
        scope.postBucketList = scope.post.getBuckets();
        scope.currentUserHasFavorited = scope.post.hasFavorited(scope.currentUser);
        if (scope.isShare) {
          scope.shareAuthor = scope.share.getAuthor();
          scope.shareBucketList = scope.share.getBuckets();
          scope.mainContent = scope.share.content.textString;
        }
        var step1Promises = UtilFunctions.getResourcePromises([scope.author, scope.comments, scope.postBucketList, scope.shareAuthor, scope.shareBucketList]);
        $q.all(step1Promises).then(initializeStep2);
      }

      function initializeStep2() {
        scope.scrollComments = true;
        scope.isOwner = scope.currentUser && scope.currentUser._id === scope.author._id;
        scope.authorDisplayName = scope.author.getDisplayName();
        if (scope.isShare) {
          scope.isOwner = scope.currentUser && scope.currentUser._id === scope.shareAuthor._id;
          scope.shareAuthorDisplayName = scope.shareAuthor.getDisplayName();
        }
      }

      scope.edit = function() {
        scope.newContent = scope.mainContent;
        scope.editing = true;
      };

      scope.updatePostContent = function(newContent) {
        if (scope.isShare) {
          scope.share.content.textString = newContent;
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

      scope.toggleFavorite = function() {
        scope.post.toggleFavorite(scope.currentUser);
        scope.currentUserHasFavorited = !scope.currentUserHasFavorited;
      };

      scope.commentToAdd = '';
      scope.addComment = function(event) {
        if (event.keyCode != 13 || !scope.currentUser) return;
        var comment = new Comment({
          author: scope.currentUser._id,
          content: {
            textString: scope.commentToAdd
          },
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