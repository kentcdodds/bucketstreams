angular.module('bs.models').factory('Bucket', function($resource, Cacher) {
  var Bucket = $resource('/api/v1/rest/buckets/:id', { id: '@_id' });
  Bucket.prototype.selected = function(newState) {
    if (!_.isUndefined(newState)) {
      this.isSelected = newState;
    }
    return this.isSelected;
  };
  Bucket.prototype.toggleSelected = function() {
    return this.selected(!this.selected());
  };
  Bucket.prototype.getOwner = function() {
    return Cacher.userCache.get(this.owner);
  };
  Bucket.prototype.getContributors = function() {
    return Cacher.userCache.getAll(this.contributors);
  };
  return Bucket;
});