angular.module('bs.common.services').factory('UtilService', function(_, Cacher, $http, $q, BaseUrl, Post, Share, Comment, User, Stream, Bucket, CurrentUserInfoService, AlertEventBroadcaster) {
  var utilPrefix = BaseUrl + '/api/v1/util/';
  var authPrefix = BaseUrl + '/api/v1/auth/';
  //noinspection UnnecessaryLocalVariableJS
  var util = {
    validateModel: function(model, params) {
      return $http({
        url: utilPrefix + 'validate/' + model,
        method: 'GET',
        params: params
      });
    },
    loadData: function (type, username, typeName, options) {
      var deferred = $q.defer();
      options = options || {};
      $http({
        method: 'GET',
        url: utilPrefix + 'data/' + type,
        params: {
          username: username,
          name: typeName,
          limit: options.limit,
          page: options.page,
          skip: options.skip
        }
      }).then(function (response) {
        var data = response.data;
        data.thing = Cacher[type + 'Cache'].putById(data.thing);
        var modelGroups = [
          { propName: 'user', model: User },
          { propName: 'bucket', model: Bucket },
          { propName: 'stream', model: Stream },
          { propName: 'post', model: Post },
          { propName: 'share', model: Share },
          { propName: 'comment', model: Comment },
          { propName: 'sharePosts', model: Post }
        ];
        _.each(modelGroups, function(group) {
          var cache = Cacher[group.propName + 'Cache'];
          _.each(data[group.propName + 's'], function(item, index) {
            // add to cache and reset the value to the resource version.
            data[group.propName + 's'][index] = cache.putById(data[group.propName + 's'][index]);
          });
        });
        deferred.resolve(data);
      }, deferred.reject);
      return deferred.promise;
    },
    loadPost: function (postId) {
      return $http.get(utilPrefix + 'data/post/' + postId).then(function(response) {
        var data = response.data;
        data.post = Cacher.postCache.putById(data.post);
        var modelGroups = [
          { propName: 'user', model: User },
          { propName: 'comment', model: Comment }
        ];
        _.each(modelGroups, function(group) {
          var cache = Cacher[group.propName + 'Cache'];
          _.each(data[group.propName + 's'], function(item, index) {
            // add to cache and reset the value to the resource version.
            data[group.propName + 's'][index] = cache.putById(data[group.propName + 's'][index]);
          });
        });
        return data.post;
      }, function(err) {
        throw err;
      });
    },
    sendResetPasswordEmail: function(username) {
      return $http({
        method: 'POST',
        url: authPrefix + 'reset-password',
        data: {
          username: username
        }
      });
    },
    importProfilePhoto: function(provider) {
      return $http.get(authPrefix + 'get-profile-photo/' + provider).then(function(response) {
        CurrentUserInfoService.refreshUser();
        AlertEventBroadcaster.broadcast({
          message: 'Profile picture updated!',
          type: 'success'
        });
        return response;
      }, function(err) {
        AlertEventBroadcaster.broadcast({
          message: err.message || err,
          type: 'error'
        });
        throw err;
      });
    },
    callbackProvider: function(provider, query) {
      var params = [];
      _.each(query, function(value, key) {
        params.push(key + '=' + encodeURIComponent(value));
      });
      return $http.get('/third-party/' + provider + '/callback?' + params.join('&'));
    }
  };
  return util;
});