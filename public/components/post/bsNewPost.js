angular.module('bs.directives').directive('bsNewPost', function(Post, _, AlertService, $document, PostBroadcaster) {
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
    templateUrl: '/components/post/bsNewPost.html',
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
        PostBroadcaster.broadcastNewPost(post);
        post.$save(function(){
          scope.onSave && scope.onSave({post: post});
          resetState();
          AlertService.success('Post saved');
          if ($document[0].activeElement === postButton[0]) {
            textarea[0].focus();
          }
        }, function(err) {
          PostBroadcaster.broadcastRemovedPost(post);
          AlertService.error(err.message);
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