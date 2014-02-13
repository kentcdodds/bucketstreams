angular.module('bs.models').factory('Bucket', function($resource) {
  return $resource('/api/v1/buckets/:id', { id: '@_id' });
});