angular.module('bs.models').factory('Comment', function($resource, Cacher) {
  var Comment = $resource('/api/v1/rest/comments/:id', { id: '@_id' });
  Comment.prototype.getAuthor = function() {
    return Cacher.userCache.get(this.author);
  };
  return Comment;
});