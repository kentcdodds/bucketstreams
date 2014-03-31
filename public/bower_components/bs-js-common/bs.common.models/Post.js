angular.module('bs.common.models').factory('Post', function($resource, BaseUrl, Cacher) {
  var Post = $resource(BaseUrl + '/api/v1/rest/posts/:id', { id: '@_id' });
  Post.prototype.getAuthor = function() {
    return Cacher.userCache.get(this.author);
  };
  Post.prototype.getComments = function() {
    return Cacher.commentCache.where({owningPost: this._id});
  };
  Post.prototype.toggleFavorite = function(_id) {
    if (_.isObject(_id)) {
      _id = _id._id;
    }
    this.favorites = this.favorites || [];
    if (_.contains(this.favorites, _id)) {
      this.favorites = _.remove(this.favorites, _id);
    } else {
      this.favorites.push(_id);
    }
    return this.$save();
  };
  Post.prototype.hasFavorited = function(_id) {
    if (_.isObject(_id)) {
      _id = _id._id;
    }
    return _.contains(this.favorites, _id);
  };
  Post.prototype.getBuckets = function() {
    return Cacher.bucketCache.getAll(this.buckets);
  };
  return Post;
});