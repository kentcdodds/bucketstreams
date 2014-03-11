angular.module('bs.models').factory('Bucket', function($resource) {
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
  return Bucket;
});