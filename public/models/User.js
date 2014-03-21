angular.module('bs.models').factory('User', function($resource, $http, $q, _, UtilFunctions, $window) {
  var User = $resource('/api/v1/rest/users/:id', { id: '@_id' }, {
    dicsoverUsers: {
      method: 'GET',
      url: '/api/v1/rest/users/discover',
      isArray: true,
      params: {
        username: 'me'
      }
    }
  });
  var authPrefix = '/api/v1/auth';
  User.register = function(email, password) {
    return $http({
      method: 'POST',
      url: authPrefix + '/register',
      data: {
        email: email,
        password: password
      }
    });
  };

  User.login = function(username, password) {
    return $http({
      method: 'POST',
      url: authPrefix + '/login',
      data: {
        username: username,
        password: password
      }
    });
  };

  User.logout = function() {
    $window.location.href = authPrefix + '/logout';
  };

  User.prototype.logout = function() {
    User.logout();
  };

  User.prototype.getDisplayName = function() {
    if (UtilFunctions.testHasPosterity(this.name, ['first', 'last'], true)) {
      return (this.name.first || '') + ' ' + (this.name.last || '');
    } else if (this.username) {
      return '@' + this.username;
    } else {
      return 'Anonymous';
    }
  };

  User.prototype.getProfilePicture = function() {
    return this.profilePicture || '/images/guest-photo.png';
  };

  User.prototype.isDontRemind = function(fieldDisplayName) {
    return this.dontRemind && _.contains(this.dontRemind, fieldDisplayName);
  };

  User.prototype.addDontRemind = function(fieldDisplayName) {
    this.dontRemind = this.dontRemind || [];
    this.dontRemind.push(fieldDisplayName);
  };

  User.prototype.removeDontRemind = function(fieldDisplayName) {
    _.remove(this.dontRemind, function(item) {
      return item === fieldDisplayName;
    });
  };

  User.prototype.toggleDontRemind = function(fieldDisplayName) {
    if (this.isDontRemind(fieldDisplayName)) {
      this.removeDontRemind(fieldDisplayName);
    } else {
      this.addDontRemind(fieldDisplayName);
    }
  };

  User.prototype.hasUsername = function() {
    return !_.isEmpty(this.username);
  };

  User.prototype.hasProfilePicture = function() {
    return UtilFunctions.testHasPosterity(this.profilePicture, '0.url');
  };

  User.prototype.hasFullName = function() {
    return !_.isEmpty(this.name) && !_.isEmpty(this.name.first) && !_.isEmpty(this.name.last);
  };

  User.prototype.hasPhone = function() {
    return !_.isEmpty(this.phone);
  };

  User.prototype.hasEmail = function() {
    return !_.isEmpty(this.email);
  };

  User.prototype.hasOutboundRules = function() {
    return !_.isEmpty(this.rules) && this.rules.length > 0;
  };

  User.prototype.hasInboundRules = function(provider) {
    return UtilFunctions.testHasPosterity(this.connectedAccounts, provider + '.rules.0');
  };

  User.prototype.isConnectedTo = function(provider) {
    return this.connectedAccounts && this.connectedAccounts[provider] && this.connectedAccounts[provider].accountId;
  };

  User.prototype.disconnectFrom = function(provider) {
    this.connectedAccounts[provider].accountId = null;
    this.connectedAccounts[provider].secret = null;
    return this.$save();
  };

  function getRuleIndex(user, provider, type, rule) {
    user.connectedAccounts[provider].rules = user.connectedAccounts[provider].rules || {};
    user.connectedAccounts[provider].rules[type] = user.connectedAccounts[provider].rules[type] || [];
    return _.findIndex(user.connectedAccounts[provider].rules[type], {_id: rule._id});
  }

  User.prototype.addOrUpdateRule = function(provider, type, rule) {
    var index = getRuleIndex(this, provider, type, rule);
    if (index > -1) {
      this.connectedAccounts[provider].rules[type][index] = rule;
    } else {
      this.connectedAccounts[provider].rules[type].push(rule);
    }
    return this.$save();
  };

  User.prototype.deleteRule = function(provider, type, rule) {
    var index = getRuleIndex(this, provider, type, rule);
    if (index > -1) {
      this.connectedAccounts[provider].rules[type].splice(index, 1);
      return this.$save();
    } else {
      return $q.when(this);
    }
  };
  
  User.prototype.isConfirmed = function() {
    return this.emailConfirmation && this.emailConfirmation.confirmed;
  };

  User.prototype.getFieldsToFill = function() {
    var fields = [];
    function assignField(displayName, filledInFn, filledInFnArg) {
      fields.push({
        filledInFn: filledInFn,
        filledInFnArg: filledInFnArg,
        displayName: displayName,
        formName: displayName.replace(/ /g, '-').toLowerCase()
      });
    }

    assignField('Profile Picture', 'hasProfilePicture');
    assignField('Full Name', 'hasFullName');
    assignField('Phone Number', 'hasPhone');
    /* TODO: Make these fields rock.
    assignField('Inbound Rules', 'hasOutboundRules');
    _.each(['Facebook', 'Twitter', 'Google'], function(provider) {
      assignField(provider + ' Connection', 'isConnectedTo', provider.toLowerCase());
      assignField('Inbound ' + provider + ' Rules', 'hasInboundRules', provider.toLowerCase());
    });
    */
    return fields;
  };

  return User;
});