angular.module('bs.models').factory('Comment', function($resource) {
  return $resource('/api/v1/rest/comments/:id', { id: '@_id' });
});