angular.module('bs.common.models').factory('Bucket', function($resource, Cacher, BaseUrl) {
  var Bucket = $resource(BaseUrl + '/api/v1/rest/buckets/:id', { id: '@_id' });
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
  Bucket.prototype.getPageParams = function() {
    return {
      username: this.getOwner().username,
      type: 'bucket',
      itemName: this.name
    };
  };
  return Bucket;
});