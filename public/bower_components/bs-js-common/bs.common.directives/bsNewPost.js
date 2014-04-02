angular.module('bs.common.directives').directive('bsNewPost', function(Post, _, $document) {
  var placeholders = [
    'What are you thinking?',
    'Anything cool happen today?',
    'What\'s your favorite color?',
    'What did you do today?',
    'What funny joke did you hear today?',
    'What made today so awesome?'
  ];

  return {
    restrict: 'E',
    templateUrl: 'templates/bsNewPost.html',
    replace: true,
    scope: {
      user: '=',
      buckets: '=',
      onSave: '&'
    },
    link: function(scope, el) {
      var postButton = el.find('button');
      var textarea = el.find('textarea');

      scope.makePost = function() {
        var post = new Post({
          author: scope.user._id,
          modified: new Date(),
          content: scope.content,
          buckets: _.pluck(_.filter(scope.buckets, function(bucket) {
            return bucket.isMain || bucket.selected()
          }), '_id')
        });
        scope.$emit('post.created.start', post);
        post.$save(function(){
          scope.$emit('post.created.success', post);
          scope.onSave && scope.onSave({post: post});
          resetState();
          if ($document[0].activeElement === postButton[0]) {
            textarea[0].focus();
          }
        }, function(err) {
          scope.$emit('post.created.error', post, err);
        });
      };

      function resetState() {
        scope.content = {
          textString: '',
          multimedia: {}
        };
        scope.randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
      }
      resetState();

    }
  }
});