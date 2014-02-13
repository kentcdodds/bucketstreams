angular.module('bs.models').factory('CurrentUser', function($resource) {
  return $resource('/api/v1/users/me').get();
});