angular.module('bs.services').factory('UtilService', function(_, $http) {
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