angular.module('bs.common.models').factory('User', function($resource, $http, $q, BaseUrl, _, UtilFunctions, $window, moment) {
  var User = $resource(BaseUrl + '/api/v1/rest/users/:id', { id: '@_id' }, {
    dicsoverUsers: {
      method: 'GET',
      url: BaseUrl + '/api/v1/rest/users/discover',
      isArray: true,
      params: {
        username: 'me'
      }
    }
  });
  var authPrefix = BaseUrl + '/api/v1/auth/';

  User.register = function(email, password) {
    return loginOrRegister('register', email, password);
  };

  User.login = function(email, password) {
    return loginOrRegister('login', email, password);
  };

  function loginOrRegister(type, username, password) {
    return $http({
      method: 'POST',
      url: authPrefix + type,
      data: {
        email: username,
        password: password
      }
    }).then(function(response) {
      var token = response.data.token;
      $window.localStorage.setItem('user-token', token);
      return response;
    }, function(err) {
      $window.localStorage.removeItem('user-token');
      throw err;
    });
  }

  User.logout = function() {
    $window.localStorage.removeItem('user-token');
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

  User.prototype.isTimeToRemind = function(key) {
    return !this.shouldNeverRemind(key) &&
      (_.isEmpty(this.extraInfo.reminders) ||
      _.isEmpty(this.extraInfo.reminders[key]) ||
      moment().diff(this.extraInfo.reminders[key]) > 0);
  };

  User.prototype.addReminderTime = function(key, time) {
    this.extraInfo.reminders = this.extraInfo.reminders || {};
    this.extraInfo.reminders[key] = time;
  };

  User.prototype.addReminderTimeInDays = function(key, days) {
    var then = moment().add(days, 'days');
    var dateInFuture = moment({y: then.year(), M: then.month(), d: then.date()}).toJSON();
    this.addReminderTime(key, dateInFuture);
  };

  User.prototype.removeReminder = function(key) {
    if (!_.isEmpty(this.extraInfo) && !_.isEmpty(this.extraInfo.reminders)) {
      delete this.extraInfo.reminders[key];
    }
  };

  User.prototype.neverRemind = function(key) {
    this.removeReminder(key);
    this.extraInfo.neverRemind = this.extraInfo.neverRemind || [];
    if (!this.shouldNeverRemind(key)) {
      this.extraInfo.neverRemind.push(key);
    }
  };

  User.prototype.shouldNeverRemind = function(key) {
    return _.contains(this.extraInfo.neverRemind, key);
  };

  User.prototype.hasReminder = function(key) {
    return this.extraInfo.reminders && !!this.extraInfo.reminders[key];
  };

  User.prototype.hasUsername = function() {
    return !_.isEmpty(this.username);
  };

  User.prototype.hasProfilePicture = function() {
    return !_.isEmpty(this.profilePicture);
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
    return $http.get(authPrefix + 'disconnect/' + provider);
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
    return this.emailConfirmed;
  };

  return User;
});