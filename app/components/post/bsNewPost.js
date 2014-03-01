angular.module('bs.directives').directive('bsNewPost', function(CurrentUserService) {
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
    templateUrl: '/components/post/bsNewPost.html',
    replace: true,
    scope: {
      onPostClick: '&'
    },
    link: function(scope, el) {
      scope.currentUser = CurrentUserService.getUser();
      scope.$on(CurrentUserService.userUpdateEvent, function(user) {
        scope.currentUser = user;
      });

      scope.makePost = function() {
        scope.onPostClick({content: scope.content});
      };
      scope.content = {
        textString: '',
        multimedia: []
      };
      scope.stringContent = '';
      scope.randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    }
  }
});