angular.module('bs.models').factory('Stream', function($resource) {
  var Stream = $resource('/api/v1/rest/streams/:id', { id: '@_id' });

  Stream.prototype.isPublic = function() {
    return this.visibility.length === 0;
  };
  return Stream;
});