angular.module('bs.models').factory('User', function($resource, $http) {
  var User = $resource('/api/v1/users/:id', { id: '@_id' });
  User.register = function(email, password) {
    return $http({
      method: 'POST',
      url: '/register',
      data: {
        email: email,
        password: password
      }
    });
  };

  User.login = function(username, password) {
    return $http({
      method: 'POST',
      url: '/login',
      data: {
        username: username,
        password: password
      }
    });
  };
  return User;
});