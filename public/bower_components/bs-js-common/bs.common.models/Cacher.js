angular.module('bs.common.models').factory('Cacher', function($cacheFactory, _) {
  var cacher = {
    userCache: null,
    streamCache: null,
    bucketCache: null,
    postCache: null,
    shareCache: null,
    commentCache: null
  };
  
  function getResource(cacheable, _id) {
    var resource = cacheable.model.get({id: _id});
    resource.$promise.then(function(val) {
      putToCacheById(cacheable.cache, val);
    });
    return resource;
  }

  function putToCacheById(cache, item) {
    if (_.isEmpty(item)) {
      return null;
    }
    return cache.put(item._id, item);
  }
  
  function putAllToCache(cache, items) {
    if (!_.isArray(items)) {
      items = [items]
    }
    _.each(items, function(item) {
      putToCacheById(cache, item);
    });
  }
  
  cacher.initialize = function(cacheables) {
    _.each(cacheables, function(cacheable) {
      var name = cacheable.name;
      
      var aCache = $cacheFactory(name);
      
      cacheable.cache = aCache;
      cacheable.allItems = []; // For where query
      
      cacher[name + 'Cache'] = {
        put: function(key, value) {
          if (!_.isFunction(value.$get)) {
            value = new cacheable.model(value);
          }
          var existingVal = aCache.get(value._id);
          if (existingVal) {
            _.extend(existingVal, value);
          } else {
            cacheable.allItems.push(value);
          }
          return aCache.put.apply(aCache, arguments);
        },
        get: function(_id) {
          if (_.isObject(_id)) {
            _id = _id._id;
          }
          var item = aCache.get.apply(aCache, arguments);
          if (item) {
            return item;
          } else {
            return getResource(cacheable, _id);
          }
        },
        getAll: function(ids) {
          var all = [];
          if (!_.isArray(ids)) {
            ids = [ids]
          }
          _.each(ids, function(id) {
            all.push(cacher[name + 'Cache'].get(id));
          });
          return all;
        },
        remove: function(key) {
          return aCache.remove.apply(aCache, arguments);
        },
        removeAll: function() {
          return aCache.removeAll.apply(aCache, arguments);
        },
        removeById: function(item) {
          return this.remove(item._id);
        },
        destroy: function() {
          return aCache.destroy.apply(aCache, arguments);
        },
        info: function() {
          return aCache.info.apply(aCache, arguments);
        },
        putAllById: function(items) {
          putAllToCache(aCache, items);
          return items;
        },
        putById: function(item) {
          return putToCacheById(cacher[name + 'Cache'], item);
        },
        where: function(query) {
          Array.prototype.unshift.call(arguments, cacheable.allItems);
          return _.where.apply(_, arguments);
        }
      };
      
    });
  };
  /**
   * A collection of caches called userCache, streamCache, bucketCache, postCache, commentCache
   * Each is a regular $cacheFactory with the following methods:
   *  - info()
   *  - put(key, item)
   *  - get(key) - This is hijacked to return a resource if there is no item with that key.
   *  - remove(key)
   *  - removeAll()
   *  - destroy()
   * Then they have additional methods:
   *  - getAll(ids) - This can be an array or a single object - Returns array
   *  - putAllById(items) - This can be an array or a single object - Returns the array.
   *  - putById(item) - This can only be a single object. Returns the item.
   *  - where(query) - Query all the elements in the cache
   */
  return cacher;
});