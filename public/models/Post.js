angular.module('bs.models').factory('Post', function($resource, Cacher) {
  var Post = $resource('/api/v1/rest/posts/:id', { id: '@_id' });
  Post.prototype.getAuthor = function() {
    return Cacher.userCache.get(this.author);
  };
  Post.prototype.getComments = function() {
    return Cacher.commentCache.where({owningPost: this._id});
  };
  return Post;
});