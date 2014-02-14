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

  User.prototype.getDisplayName = function() {
    if (this.name) {
      return this.name.first + ' ' + this.name.last;
    } else if (this.username) {
      return '@' + this.username;
    } else {
      return this.email || '';
    }
  };

  User.prototype.getProfilePicture = function() {
    var profilePicture = '/images/guest-photo.png';
    if (this.profilePicture && this.profilePicture.url) {
      profilePicture = this.profilePicture.url;
    }
    return profilePicture;
  };
  return User;
});