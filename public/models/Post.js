angular.module('bs.models').factory('Post', function($resource, Cacher) {
  var Post = $resource('/api/v1/rest/posts/:id', { id: '@_id' });
  Post.prototype.getAuthor = function() {
    return Cacher.userCache.get(this.author);
  };
  Post.prototype.getComments = function() {
    return Cacher.commentCache.where({owningPost: this._id});
  };
  Post.prototype.addFavorite = function(_id) {
    if (_.isObject(_id)) {
      _id = _id._id;
    }
    this.favorites = this.favorites || [];
    this.favorites.push(_id);
    return this.$save();
  };
  Post.prototype.getBuckets = function() {
    return Cacher.bucketCache.get(this.buckets);
  };
  return Post;
});