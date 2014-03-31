angular.module('bs.common.models').factory('Share', function($resource, BaseUrl, Cacher) {
  var Share = $resource(BaseUrl + '/api/v1/rest/shares/:id', { id: '@_id' });
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