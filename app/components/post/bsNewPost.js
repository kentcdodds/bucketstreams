angular.module('bs.directives').directive('bsNewPost', function(Post, _, AlertService, $document) {
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
      buckets: '='
    },
    link: function(scope, el) {
      var postButton = el.find('button');
      var textarea = el.find('textarea');

      scope.makePost = function() {
        var post = new Post({
          author: scope.currentUser._id,
          content: scope.content,
          buckets: _.pluck(_.filter(scope.buckets, function(bucket) {
            return bucket.isMain || bucket.isSelected
          }), '_id')
        });
        post.$save(function(){
          resetState();
          AlertService.success('Post saved');
          if ($document[0].activeElement === postButton[0]) {
            textarea[0].focus();
          }
          //TODO Figure out how to add this to the post view if applicable......
        }, function(err) {
          //TODO Figure out how to remove this from the post view if applicable.
          AlertService.error(err.message);
        });
      };

      function resetState() {
        scope.content = {
          textString: '',
          multimedia: {}
        };
        scope.randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
        _.each(scope.buckets, function(bucket) {
          bucket.isSelected = false;
        });
      }
      resetState();

    }
  }
});