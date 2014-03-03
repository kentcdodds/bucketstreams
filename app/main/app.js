(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'pasvaz.bindonce', 'angularFileUpload'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives', 'bs.models', 'bs.services', 'bs.filters'];
  var app = angular.module('bs.app', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    var commonResolve = {
      currentUser: function(CurrentUserService) {
        var currentUser = CurrentUserService.getUser();
        if (currentUser.$resolved) {
          return currentUser;
        } else {
          return currentUser.$promise;
        }
      }
    };

    $stateProvider.
      state('home', {
        url: '/',
        templateUrl: '/main/index.html',
        controller: 'MainCtrl',
        resolve: {
          currentUser: commonResolve.currentUser
        },
        onEnter: function() {
          console.log('home');
        }
      }).
      state('home.gettingStarted', {
        url: 'getting-started',
        onEnter: function($state, $modal, CurrentUserService) {
          var currentUser = CurrentUserService.getUser();
          if (currentUser.hasUsername() && currentUser.hasProfilePicture()) {
            return $state.transitionTo('home');
          }
          $modal.open({
            templateUrl: '/main/getting-started/getting-started.html',
            controller: 'GettingStartedCtrl',
            backdrop: 'static'
          }).result.then(function() {
              return $state.go('home');
            });
        }
      }).
      state('home.settings', {
        url: 'settings',
        controller: 'SettingsCtrl',
        templateUrl: '/main/settings/settings.html',
        onEnter: function() {
          console.log('settings');
        }
      }).
      state('home.userPage', {
        url: ':username',
        controller: 'ProfileCtrl',
        templateUrl: '/main/profile/profile.html',
        resolve: {
          profileUser: function($q, $stateParams, User) {
            var deferred = $q.defer();
            User.query({username: $stateParams.username}).$promise.then(function(data) {
              deferred.resolve(data[0]);
            }, deferred.reject);
            return deferred.promise;
          },
          buckets: function(Bucket, $stateParams) {
            return Bucket.query({username: $stateParams.username});
          },
          streams: function(Stream, $stateParams) {
            return Stream.query({username: $stateParams.username});
          }
        },
        onEnter: function($stateParams) {
          console.log($stateParams);
        }
      }).
      state('home.newBucketOrStream', {
        url: 'new/{type:bucket|stream}',
        onEnter: function($state, $stateParams, $modal, Bucket, Stream) {
          $modal.open({
            templateUrl: '/main/new-bucket-stream/new-bucket-stream.html',
            controller: 'NewBucketStreamCtrl',
            resolve: {
              currentUser: commonResolve.currentUser,
              type: function() {
                return $stateParams.type;
              },
              model: function() {
                return $stateParams.type === 'bucket' ? Bucket : Stream;
              }
            }
          });
        }
      }).
      state('home.postStreamPage', {
        url: ':username/:type/:itemName',
        controller: 'PostStreamPageCtrl',
        abstract: true,
        templateUrl: '/main/post-stream-page/postStreamPage.html',
        resolve: {
          data: function loadStreamOrBucketPageData($q, $state, $stateParams, UtilService, Bucket, Stream) {
            var deferred = $q.defer();
            console.log('running the thing');
            var type = $stateParams.type;
            var model = (type === 'stream' ? Stream : Bucket);
            UtilService.loadData(type, $stateParams.username, $stateParams.itemName, model).then(function(data) {
              if (data) {
                data.type = type;
                deferred.resolve(data);
              } else {
                deferred.reject('No ' + type);
                $state.go('home');
              }
            }, deferred.reject);
            return deferred.promise;
          }
        },
        onEnter: function($state, $stateParams) {
          console.log('postStreamPage', $stateParams);
        }
      }).
      state('home.postStreamPage.bucket', {
        url: '',
        controller: 'BucketCtrl',
        templateUrl: '/main/buckets/bucket.html',
        onEnter: function($stateParams) {
          console.log('bucketPage', $stateParams);
        }
      }).
      state('home.postStreamPage.stream', {
        url: '',
        controller: 'StreamCtrl',
        templateUrl: '/main/streams/stream.html',
        onEnter: function($stateParams) {
          console.log('streamPage', $stateParams);
        }
      }).
      state('home.postPage', {
        controller: 'PostPageCtrl',
        templateUrl: '/main/post-page/post-page.html',
        url: ':username/:postId',
        resolve: {
          post: function($q, UtilService, $stateParams) {
            var deferred = $q.defer();
            UtilService.loadPost($stateParams.postId).then(function(response) {
              deferred.resolve(response.data);
            }, deferred.reject);
            return deferred.promise;
          }
        }
      });

    $urlRouterProvider.otherwise('/');
  });
})();
