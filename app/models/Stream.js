angular.module('bs.models').factory('Stream', function($resource, _) {
  var Stream = $resource('/api/v1/rest/streams/:id', { id: '@_id' }, {
    save: {
      method: 'POST',
      transformRequest: function(resource) {
        delete resource.isSelected;
        return JSON.stringify(resource);
      }
    }
  });

  Stream.prototype.isPublic = function() {
    return this.visibility.length === 0;
  };

  Stream.prototype.selected = function(newState) {
    if (!_.isUndefined(newState)) {
      this.isSelected = newState;
    }
    return this.isSelected;
  };
  Stream.prototype.toggleSelected = function() {
    return this.selected(!this.selected());
  };

  Stream.prototype.isSubscribed = function(thing) {
    return _.contains(this.subscriptions.buckets.concat(this.subscriptions.streams), thing._id);
  };

  Stream.prototype.toggleSubscription = function(thing, type) {
    var self = this;
    var selected = true;
    if (_.contains(self.subscriptions[type], thing._id)) {
      self.subscriptions[type] = _.without(self.subscriptions[type], thing._id);
      selected = false;
    } else {
      self.subscriptions[type].push(thing._id);
    }
    return self.$save(function() {
      self.selected(selected);
    }, function(err) {
      self.selected(!selected);
    });
  };

  return Stream;
});