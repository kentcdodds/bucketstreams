angular.module('bs.models').factory('Stream', function($resource, $http) {
  var Stream = $resource('/api/v1/streams/:id', { id: '@_id' });
  Stream.prototype.isPublic = function() {
    return this.visibility.length === 0;
  };
  Stream.prototype.getPosts = function() {
    return $http.get('/api/v1/streams/' + this._id + '/posts');
  };
  return Stream;
});