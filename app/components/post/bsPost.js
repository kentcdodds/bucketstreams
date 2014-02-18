angular.module('bs.directives').directive('bsPost', function() {
  var modes = {
    create: 'create'
  };
  var placeholders = [
    'What are you thinking?',
    'Anything cool happen today?',
    'What\'s your favorite color?',
    'What did you do today?',
    'What funny joke did you hear today?',
    'What made today so awesome?'
  ];

  return {
    restrict: 'A',
    templateUrl: '/components/post/bsPost.html',
    replace: true,
    scope: {
      post: '=bsPost',
      currentUser: '=?',
      mode: '@'
    },
    link: function(scope, el) {
      if (scope.mode === modes.create) {
        scope.makePost = function(content) {
          scope.post.addContent(content);
        };
        scope.randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
      } else {
        scope.commentToAdd = '';
        scope.addComment = function(event) {
          if (event.keyCode != 13) return;
          scope.post.comments.push({
            author: scope.currentUser,
            content: scope.commentToAdd,
            modified: new Date()
          });
          scope.commentToAdd = '';
        };

        scope.showOrHideComment = function(comment) {
          comment.showDelete = comment.author.username === scope.currentUser.username;
        };

        scope.deleteComment = function(comment) {
          if (comment.author.username === scope.currentUser.username) {
            var index = scope.post.comments.indexOf(comment);
            if (index > -1) {
              scope.post.comments.splice(index, 1);
            }
          }
        }
      }
    }
  }
});