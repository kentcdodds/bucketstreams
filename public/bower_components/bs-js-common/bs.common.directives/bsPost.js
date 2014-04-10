/*
 * This directive emits the following events:
 *  - share.removed.start
 *  - share.removed.success
 *  - share.removed.error
 *  - post.removed.start
 *  - post.removed.success
 *  - post.removed.error
 *  - share.new
 */
angular.module('bs.common.directives').directive('bsPost', function(CurrentUserInfoService, _, $q, Cacher, User, Comment, UtilFunctions, $sce) {
  return {
    restrict: 'A',
    templateUrl: 'templates/bsPost.html',
    replace: true,
    scope: {
      bsPost: '='
    },
    link: function(scope, el, attrs) {
      scope.post = scope.bsPost.post;
      scope.share = scope.bsPost.share;
      scope.isShare = !!scope.share;
      scope.postOnly = attrs.hasOwnProperty('postOnly');
      scope.currentUser = CurrentUserInfoService.getUser();
      scope.$on(CurrentUserInfoService.events.user, function(event, user) {
        scope.currentUser = user;
        $q.all(UtilFunctions.getResourcePromises(user)).then(function() {
          if (scope.author && scope.author._id === user._id) {
            scope.author = user;
          }
          if (scope.shareAuthor && scope.shareAuthor._id === user._id) {
            scope.shareAuthor = user;
          }
        })
      });
      var initialPromises = UtilFunctions.getResourcePromises([scope.post, scope.share, scope.currentUser]);
      $q.all(initialPromises).then(initializeStep1);

      function initializeStep1() {
        scope.noPost = scope.post.success === false;
        if (!scope.noPost) {
          scope.author = scope.post.getAuthor();
          scope.comments = scope.post.getComments();
          scope.postBucketList = scope.post.getBuckets();
          scope.currentUserHasFavorited = scope.post.hasFavorited(scope.currentUser);
        } else {
          scope.post.content = {};
          if (scope.post.err === 'Record not found') {
            scope.post.content.textString = 'This post has been removed! Sorry about that...';
          } else {
            scope.post.content.textString = 'There was a problem loading this post... Sorry :-(';
          }
          scope.author = new User({ username: 'unknown_user', name: { first: 'Unknown', last: 'User' } });
        }
        if (scope.isShare) {
          scope.shareAuthor = scope.share.getAuthor();
          scope.shareBucketList = scope.share.getBuckets();
          scope.mainContent = $sce.trustAsHtml(scope.share.getHtml());
        } else {
          scope.mainContent = $sce.trustAsHtml(scope.post.getHtml());
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
        scope.newContent = scope.post.content.textString;
        if (scope.isShare) {
          scope.newContent = scope.share.content.textString;
        }
        scope.editing = true;
      };

      scope.updatePostContent = function(newContent) {
        var thing = scope.isShare ? 'share' : 'post';
        scope[thing].content.textString = newContent;
        scope[thing].$save(function() {
          scope.mainContent = $sce.trustAsHtml(scope[thing].getHtml());
          scope.editing = false;
        });
      };

      scope.deleteComment = function(comment) {
        _.remove(scope.comments, comment);
      };

      scope.removePost = function() {
        if (scope.isShare) {
          scope.$emit('share.removed.start', scope.share);
          scope.share.$remove(function() {
            scope.$emit('share.removed.success', scope.share);
          }, function(err) {
            scope.$emit('share.removed.error', scope.share, err);
          });
        } else {
          scope.$emit('post.removed.start', scope.post);
          scope.post.$remove(function() {
            scope.$emit('post.removed.success', scope.post);
          }, function(err) {
            scope.$emit('post.removed.error', scope.post, err);
          });
        }
      };

      scope.sharePost = function(post) {
        scope.$emit('share.new', post);
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
        comment.$save(function() {
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