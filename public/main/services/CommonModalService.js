angular.module('bs.app').factory('CommonModalService', function($modal, CurrentUserInfoService, Bucket, Stream, AlertService) {
  var CommonModalService = {
    createOrEditBucketStream: function(type, model) {
      return $modal.open({
        templateUrl: '/main/services/common-modal-templates/new-or-edit-bucket-stream.html',
        controller: function($scope, $state, model, type, currentUser, AlertService) {
          $scope.type = type;
          $scope.validationParams = {
            owner: currentUser._id
          };
          var klass = Stream;
          $scope.icon = 'smile-o';
          if (type === 'bucket') {
            klass = Bucket;
            $scope.icon = 'bitbucket';
          }
          if (!model) {
            $scope.isNew = true;
            model = new klass($scope.validationParams);
          } else {
            $scope.originalName = model.name;
          }
          $scope.thing = model;

          $scope.onSubmit = function() {
            var successMessage = 'Awesome, ' + ($scope.isNew ? 'created' : 'updated') + ' "' + $scope.thing.name + '" ' + type;
            $scope.thing.$save(function(newThing) {
              AlertService.success(successMessage);
              $scope.$close(newThing);
            }, AlertService.handleResponse.error);
          };
          $scope.deleteIt = function() {
            $scope.$close();
            CommonModalService.deleteBucketStream($scope.type, $scope.thing).result.then(function(deletedThing) {
              if (deletedThing) {
                $state.go('root.auth.home');
              }
            });
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
              var upType = type.substring(0, 1).toUpperCase() + type.substring(1, type.length);
              CurrentUserInfoService['refresh' + upType + 's']();
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
    },
    createOrEditPost: function(user, buckets, post) {
      return $modal.open({
        templateUrl: '/main/services/common-modal-templates/new-or-edit-post-modal.html',
        controller: function($scope, user, buckets, post) {
          $scope.user = user;
          $scope.buckets = buckets;
          $scope.post = post;
          $scope.isNew = !post;
          $scope.deleteIt = function() {
            var successMessage = 'Post deleted';
            $scope.post.$remove(function() {
              AlertService.info(successMessage);
              $scope.$close();
            }, AlertService.handleResponse.error);
          };
        },
        resolve: {
          user: function() {
            return user;
          },
          buckets: function() {
            return buckets;
          },
          post: function() {
            return post;
          }
        }
      });
    }
  };
  return CommonModalService;
});