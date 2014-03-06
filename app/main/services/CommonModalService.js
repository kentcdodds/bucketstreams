angular.module('bs.app').factory('CommonModalService', function($modal, CurrentUserInfoService, Bucket, Stream, AlertService) {
  return {
    newBucketStream: function(type) {
      var model = type === 'stream' ? Stream : Bucket;
      return $modal.open({
        templateUrl: '/main/services/common-modal-templates/new-bucket-stream.html',
        controller: function($scope, $state, model, type, currentUser, AlertService) {
          $scope.type = type;
          $scope.validationParams = {
            owner: currentUser._id
          };

          $scope.newThing = new model($scope.validationParams);

          $scope.onSubmit = function(valid) {
            $scope.newThing.$save(function(newThing) {
              AlertService.success('Awesome, created "' + $scope.newThing.name + '" ' + type);
              $scope.$close(newThing);
            }, AlertService.handleResponse.error);
          }
        },
        resolve: {
          currentUser: CurrentUserInfoService.getUser,
          type: function() {
            return type;
          },
          model: function() {
            return model;
          }
        }
      });
    },
    deleteBucketStream: function(type, thing) {
      return $modal.open({
        templateUrl: '/main/services/common-modal-templates/delete-template.html',
        controller: function($scope, type, thing) {
          $scope.type = type;
          $scope.thing = thing;
          $scope.deleteIt = function() {
            var successMessage = 'Deleted "' + $scope.thing.name + '" ' + $scope.type;
            $scope.thing.$remove(function() {
              CurrentUserInfoService.refreshBuckets();
              AlertService.info(successMessage);
              $scope.$close(thing);
            }, AlertService.handleResponse.error);
          }
        },
        resolve: {
          type: function() {
            return type;
          },
          thing: function() {
            return thing;
          }
        }
      });
    }
  };
});