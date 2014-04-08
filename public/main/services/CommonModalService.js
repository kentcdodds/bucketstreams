angular.module('bs.web.app').factory('CommonModalService', function($rootScope, $modal, CurrentUserInfoService, Bucket, Stream, AlertService, Cacher) {

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
            var capType = $scope.type.substring(0, 1).toUpperCase() + $scope.type.substring(1, $scope.type.length) + 's';
            $scope.thing.$save(function(newThing) {
              CurrentUserInfoService['refresh' + capType]();
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
    },
    sharePost: function(post) {
      return $modal.open({
        templateUrl: '/main/services/common-modal-templates/share-post.html',
        controller: function($scope, currentUser, post, buckets, Share) {
          $scope.bsPost = {
            post: post
          };
          $scope.buckets = buckets;
          _.each($scope.buckets, function(bucket) {
            bucket.selected(false);
          });
          $scope.currentUser = currentUser;
          $scope.share = new Share({
            sourcePost: post._id,
            author: $scope.currentUser._id,
            content: {
              textString: ''
            },
            buckets: []
          });
          $scope.onSubmit = function() {
            $scope.share.buckets = _.pluck(_.filter($scope.buckets, function(bucket) {
              var ret = bucket.isMain || bucket.selected();
              bucket.selected(false);
              return ret;
            }), '_id');
            Cacher.shareCache.putById($scope.share);
            $rootScope.$broadcast('share.created.start', $scope.share);
            $scope.share.$save(function() {
              $rootScope.$broadcast('share.created.success', $scope.share);
              post.shares++;
              post.$save();
              $scope.$close($scope.share);
            }, function(err) {
              $rootScope.$broadcast('share.created.error', $scope.share, err);
              Cacher.shareCache.removeById($scope.share);
            });
          }
        },
        resolve: {
          currentUser: CurrentUserInfoService.getUser,
          post: function() {
            return post;
          },
          buckets: function () {
            var subBuckets = [];
            _.each(CurrentUserInfoService.getBuckets(), function (bucket) {
              subBuckets.push(new Bucket({
                name: bucket.name,
                _id: bucket._id,
                isMain: bucket.isMain
              }));
            });
            return subBuckets;
          }
        }
      });
    },
    confirm: function(options) {
      return $modal.open({
        templateUrl: '/main/services/common-modal-templates/confirmation-template.html',
        controller: function($scope) {
          $scope.header = options.header || 'Are you sure?';
          $scope.message = options.message;
          $scope.yesButton = options.yesButton || 'Yes';
          $scope.cancelButton = options.cancelButton || 'Cancel';
        }
      });
    },
    pickThings: function(options) {
      return $modal.open({
        templateUrl: '/main/services/common-modal-templates/pick-buckets-or-streams.html',
        controller: function($scope) {
          $scope.question = options.question || 'Pick things...';
          $scope.sections = options.sections;
          $scope.save = function() {
            var selected = [];
            _.each($scope.sections, function(section) {
              selected = selected.concat(_.filter(section.things, 'selected'));
            });
            $scope.$close(selected);
          };
          $scope.remindLater = function() {
            $scope.$close(false); // didn't choose stuff
          };
          $scope.skip = function() {
            $scope.$close(true); // chose everything user wanted to...
          }
        }
      });
    },
    createOrEditRule: function(rule, provider, type, buckets) {
      return $modal.open({
        templateUrl: '/main/services/common-modal-templates/new-rule-template.html',
        controller: function ($scope, rule, provider, type, buckets) {
          var isInbound = /inbound/i.test(type);
          $scope.options = { advanced: false };
          if (isInbound) {
            $scope.leftIconClass = provider.icon + ' color-' + provider.name;
            $scope.rightIconClass = 'bitbucket color-bs-blue-0';
            $scope.buckets = {
              all: {
                show: true,
                description: 'Pick the buckets your post will be posted to'
              }
            };
          } else {
            $scope.rightIconClass = provider.icon + ' color-' + provider.name;
            $scope.leftIconClass = 'bitbucket color-bs-blue-0';
            $scope.buckets = {
              all: {
                description: 'The post must be in all of these buckets'
              },
              any: {
                advanced: true,
                description: 'The post must be in at least one of these buckets'
              },
              none: {
                advanced: true,
                description: 'The post must not be in any of these buckets'
              }
            };
          }

          _.each($scope.buckets, function (bucketGroup) {
            bucketGroup.list = [];
            _.each(buckets, function(bucket) {
              bucketGroup.list.push(new Bucket(bucket));
            });
          });

          $scope.hashtags = {
            all: {
              advanced: true,
              description: 'The post must have all of these hashtags'
            },
            any: {
              description: 'The post must have at least one of these hashtags'
            },
            none: {
              advanced: true,
              description: 'The post must not have any of these hashtags'
            }
          };

          var setDisplayType = [$scope.hashtags];
          if (!isInbound) {
            setDisplayType.push($scope.buckets);
          }
          _.each(setDisplayType, function (groups) {
            _.each(groups, function (group, name) {
              group.displayType = name.substring(0, 1).toUpperCase() + name.substring(1, name.length);
            });
          });

          if (!rule) {
            $scope.rule = {
              ruleType: type,
              constraints: {
                hashtags: { any: [], all: [], none: [] },
                buckets: { any: [], all: [], none: [] }
              },
              isNew: true
            };
          } else {
            $scope.rule = _.clone(rule);
            _.each($scope.hashtags, function(hashtagGroup, type) {
              hashtagGroup.text = $scope.rule.constraints.hashtags[type].join(' ');
              if (hashtagGroup.advanced && hashtagGroup.text) {
                $scope.options.advanced = true;
              }
            });
            _.each($scope.buckets, function(bucketGroup, type) {
              _.each($scope.rule.constraints.buckets[type], function(bucketId) {
                var bucket = _.find(bucketGroup.list, {_id: bucketId});
                if (bucket) {
                  bucket.selected(true);
                }
              });
            });
          }

          $scope.saveRule = function () {
            _.each($scope.hashtags, function (hashtagGroup, type) {
              if (!hashtagGroup.text) {
                $scope.rule.constraints.hashtags[type] = [];
              }
              if (!hashtagGroup.text || (!$scope.options.advanced && hashtagGroup.advanced)) return;

              $scope.rule.constraints.hashtags[type] = _.map(hashtagGroup.text.split(' '), function (tag) {
                tag = tag.trim();
                if (tag.indexOf('#') === 0) {
                  tag = tag.substring(1, tag.length);
                }
                return tag;
              });
            });
            _.each($scope.buckets, function (bucketGroup, type) {
              if (!$scope.options.advanced && bucketGroup.advanced) return;
              $scope.rule.constraints.buckets[type] = _.pluck(_.where(bucketGroup.list, 'isSelected'), '_id');
            });
            $scope.$close($scope.rule);
          };
        },
        resolve: {
          rule: function() {
            return rule;
          },
          provider: function () {
            return provider;
          },
          type: function () {
            return type;
          },
          buckets: function () {
            var subBuckets = [];
            _.each(buckets, function (bucket) {
              subBuckets.push({
                name: bucket.name,
                _id: bucket._id
              });
            });
            return subBuckets;
          }
        }
      });
    }
  };

  return CommonModalService;
});