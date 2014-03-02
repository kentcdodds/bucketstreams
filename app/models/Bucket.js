angular.module('bs.models').factory('Bucket', function($resource, UtilService) {
  var Bucket = $resource('/api/v1/rest/buckets/:id', { id: '@_id' });
  Bucket.getBucketData = function(username, bucketName) {
    return UtilService.loadData('bucket', username, bucketName, Bucket);
  };
  return Bucket;
});