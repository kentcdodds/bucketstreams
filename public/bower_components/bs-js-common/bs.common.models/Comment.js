angular.module('bs.common.models').factory('Comment', function($resource, BaseUrl, Cacher) {
  var Comment = $resource(BaseUrl + '/api/v1/rest/comments/:id', { id: '@_id' });
  Comment.prototype.getAuthor = function() {
    return Cacher.userCache.get(this.author);
  };
  return Comment;
});