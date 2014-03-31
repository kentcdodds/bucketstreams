angular.module('bs.common.services').factory('UtilService', function(_, Cacher, $http, $q, Post, Share, Comment, User, Stream, Bucket) {
  //noinspection UnnecessaryLocalVariableJS
  var util = {
    validateModel: function(model, params) {
      return $http({
        url: '/api/v1/util/validate/' + model,
        method: 'GET',
        params: params
      });
    },
    loadData: function (type, username, typeName) {
      var model = (type === 'stream' ? Stream : Bucket);
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/util/data/' + type,
        params: {
          username: username,
          name: typeName
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
          { propName: 'comment', model: Comment }
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
      return $http.get('/api/v1/util/data/post/' + postId);
    },
    sendResetPasswordEmail: function(username) {
      return $http({
        method: 'POST',
        url: '/api/v1/auth/reset-password',
        data: {
          username: username
        }
      });
    }
  };
  return util;
});