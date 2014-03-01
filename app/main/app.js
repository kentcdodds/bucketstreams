(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'pasvaz.bindonce', 'angularFileUpload'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives', 'bs.models', 'bs.services'];
  var app = angular.module('bs.app', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider.
      state('home', {
        url: '/',
        templateUrl: '/main/index.html',
        controller: 'MainCtrl',
        resolve: {
          currentUser: function(CurrentUserService) {
            return CurrentUserService.getUser().$promise;
          }
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
              return $state.transitionTo('home');
            });
        }
      }).
      state('home.settings', {
        url: 'settings',
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
      state('home.bucketPage', {
        url: ':username/buckets/:bucketName',
        controller: 'BucketCtrl',
        templateUrl: '/main/buckets/bucket.html',
        resolve: {
          bucket: function($q, $state, $stateParams, Bucket) {
            var deferred = $q.defer();
            Bucket.query({
              username: $stateParams.username,
              bucketName: $stateParams.bucketName
            }).$promise.then(function(data) {
                if (data && data.length) {
                  deferred.resolve(data[0]);
                } else {
                  deferred.reject('No bucket');
                  $state.go('home');
                }
              }, deferred.reject);
            return deferred.promise;
          }
        },
        onEnter: function($stateParams) {
          console.log($stateParams);
        }
      }).
      state('home.streamPage', {
        url: ':username/streams/:streamName',
        controller: 'StreamCtrl',
        templateUrl: '/main/streams/stream.html',
        resolve: {
          streamData: function($q, $state, $stateParams, Stream) {
            var deferred = $q.defer();
            Stream.getStreamData($stateParams.username, $stateParams.streamName).then(function(data) {
                if (data) {
                  deferred.resolve(data);
                } else {
                  deferred.reject('No stream');
                  $state.go('home');
                }
              }, deferred.reject);
            return deferred.promise;
          }
        },
        onEnter: function($stateParams) {
          console.log($stateParams);
        }
      });

    $urlRouterProvider.otherwise('/');
  });
})();
