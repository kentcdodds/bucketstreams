angular.module('bs.models').factory('Share', function($resource, Cacher) {
  var Share = $resource('/api/v1/rest/shares/:id', { id: '@_id' });
  Share.prototype.getAuthor = function() {
    return Cacher.userCache.get(this.author);
  };
  Share.prototype.getPost = function() {
    return Cacher.postCache.get(this.sourcePost);
  };
  Share.prototype.getBuckets = function() {
    return Cacher.bucketCache.getAll(this.buckets);
  };
  return Share;
});