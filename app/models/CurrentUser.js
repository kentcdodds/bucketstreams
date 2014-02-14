angular.module('bs.models').factory('CurrentUser', function($resource, User) {
  return User.get({id: 'me'});
});