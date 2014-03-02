angular.module('bs.services').factory('UtilService', function(_, $http, $q, Post, Comment) {
  function testPath(object, path) {
    var props = path.split('.');
    var value = object;
    _.each(props, function(prop) {
      value = value[prop];
      return !_.isUndefined(value);
    });
    return value;
  }
  //noinspection UnnecessaryLocalVariableJS
  var util = {
    testUniqueness: function(model, field, value) {
      return $http({
        url: '/api/v1/util/unique/' + model,
        method: 'GET',
        params: {
          field: field,
          value: value
        }
      });
    },
    loadData: function(type, username, typeName, model) {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/util/data/' + type,
        params: {
          username: username,
          name: typeName
        }
      }).then(function(response) {
        var one = response.data[type];
        var posts = response.data.posts;
        _.each(posts, function(post, postIndex) {
          _.each(post.comments, function(comment, commentIndex) {
            post.comments[commentIndex] = new Comment(comment);
          });
          posts[postIndex] = new Post(post);
        });
        var result = {};
        result[type] = new model(one);
        result.posts = posts;
        deferred.resolve(result);
      }, deferred.reject);
      return deferred.promise;
    },
    loadPost: function(postId) {
      return $http.get('/api/v1/util/data/post/' + postId);
    },
    testHasPosterity: function(object, paths, atLeastOne) {
      if (!object) {
        return false;
      }
      var hasPosterity = false;
      paths = _.isArray(paths) ? paths : [paths];
      _.each(paths, function(path) {
        hasPosterity = !_.isUndefined(testPath(object, path));
        if (hasPosterity && atLeastOne) {
          return false;
        }
        return hasPosterity;
      });
      return hasPosterity;
    },
    getGrandchild: function(object, paths) {
      if (!object) {
        return false;
      }
      var values = [];
      paths = _.isArray(paths) ? paths : [paths];
      _.each(paths, function(path) {
        values.push(testPath(object, path));
      });
      if (values.length === 1) {
        return values[0];
      }
      return values;
    },
    testGrandchild: function(object, paths, fn) {
      if (!object) {
        return false;
      }
      var values = [];
      paths = _.isArray(paths) ? paths : [paths];
      _.each(paths, function(path) {
        values.push(fn(testPath(object, path)));
      });
      if (values.length === 1) {
        return values[0];
      }
      return values;
    },
    testAllItems: function(arry, test) {
      var pass = false;
      _.each(arry, function(item) {
        pass = test(item);
        return pass;
      });
      return pass;
    },
    testAnyItems: function(arry, test) {
      var pass = false;
      _.each(arry, function(item) {
        pass = test(item);
        if (pass) {
          return false;
        }
      });
      return pass;
    },
    testNoItems: function(arry, test) {
      var pass = false;
      _.each(arry, function(item) {
        pass = test(item);
        return pass;
      });
      return !pass;
    }
  };
  return util;
});