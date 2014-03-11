angular.module('bs.models').factory('Post', function($resource) {
  return $resource('/api/v1/rest/posts/:id', { id: '@_id' });
});