angular.module('bs.models').factory('Post', function($resource) {
  var Post = $resource('/api/v1/posts/:id', { id: '@_id' });
  Post.prototype.getText = function() {
    if (this.content && this.content[0] && this.content[0].textString) {
      return this.content[0].textString;
    } else {
      return '';
    }
  };
  return Post;
});