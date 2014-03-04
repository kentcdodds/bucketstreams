angular.module('bs.app').factory('CommonModalService', function($modal, CurrentUserService, Bucket, Stream) {
  return {
    newBucketStream: function(type) {
      var model = type === 'stream' ? Stream : Bucket;
      return $modal.open({
        templateUrl: '/main/new-bucket-stream/new-bucket-stream.html',
        controller: 'NewBucketStreamCtrl',
        resolve: {
          currentUser: CurrentUserService.getUser,
          type: function() {
            return type;
          },
          model: function() {
            return model;
          }
        }
      });
    }
  };
});