angular.module('bs.models').factory('User', function($resource, $http, _, UtilService) {
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
    if (UtilService.testHasPosterity(this.name, ['first', 'last'], true)) {
      return (this.name.first || '') + ' ' + (this.name.last || '');
    } else if (this.username) {
      return '@' + this.username;
    } else {
      return this.email || '';
    }
  };

  User.prototype.hasUsername = function() {
    return !_.isEmpty(this.username);
  };

  User.prototype.hasProfilePicture = function() {
    return UtilService.testHasPosterity(this.profilePicture, '0.url');
  };

  User.prototype.hasFullName = function() {
    return UtilService.testHasPosterity(this.name, ['first', 'last']);
  };

  User.prototype.hasPhoneNumber = function() {
    return !_.isEmpty(this.phoneNumber);
  };

  User.prototype.hasOutboundRules = function() {
    return !_.isEmpty(this.rules) && this.rules.length > 0;
  };

  User.prototype.hasInboundRules = function(provider) {
    return UtilService.testHasPosterity(this.connectedAccounts, provider + '.rules.0');
  };

  User.prototype.isConnectedTo = function(provider) {
    return UtilService.testHasPosterity(this.connectedAccounts, provider + '.token');
  };

  User.prototype.isDontRemind = function(field) {
    return this.dontRemind && _.contains(this.dontRemind, field);
  };

  User.prototype.getProfilePicture = function() {
    var profilePicture = '/images/guest-photo.png';
    if (this.hasProfilePicture()) {
      profilePicture = this.profilePicture.url;
    }
    return profilePicture;
  };

  User.prototype.getFieldsToFill = function() {
    var fields = [];
    var self = this;
    function assignField(filledIn, displayName) {
      fields.push({
        displayName: displayName,
        dontRemind: self.isDontRemind(displayName),
        filledIn: filledIn,
        formName: displayName.replace(/ /g, '-').toLowerCase()
      });
    }

    assignField(this.hasProfilePicture(), 'Profile Picture');
    assignField(this.hasFullName(), 'Full Name');
    assignField(this.hasPhoneNumber(), 'Phone Number');
    assignField(this.hasOutboundRules(), 'Inbound Rules');
    assignField(this.isConnectedTo('facebook'), 'Facebook Connection');
    assignField(this.hasInboundRules('facebook'), 'Inbound Facebook Rules');
    assignField(this.isConnectedTo('twitter'), 'Twitter Connection');
    assignField(this.hasInboundRules('twitter'), 'Inbound Twitter Rules');
    assignField(this.isConnectedTo('google'), 'Google Connection');
    assignField(this.hasInboundRules('google'), 'Inbound Google Rules');

    return fields;
  };

  return User;
});