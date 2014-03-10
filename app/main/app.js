(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'pasvaz.bindonce', 'angularFileUpload', 'uxGenie', 'Scope.safeApply'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives', 'bs.models', 'bs.services', 'bs.filters'];
  var app = angular.module('bs.app', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, _) {
    $locationProvider.html5Mode(true);

    var resolveCurrentUserInfo = {};
    _.each(['User', 'Buckets', 'Streams'], function(thing) {
      resolveCurrentUserInfo['resolve' + thing] = function(CurrentUserInfoService, isAuthenticated) {
        var resource = CurrentUserInfoService['get' + thing]();
        if (_.isEmpty(resource)) {
          resource = CurrentUserInfoService['refresh' + thing]();
        }
        if (resource.$resolved) {
          return resource;
        } else {
          return resource.$promise;
        }
      }
    });

    $stateProvider.
      state('root', {
        abstract: true,
        templateUrl: '/main/index.html',
        controller: 'SuperCtrl',
        url: '/',
        resolve: {
          isAuthenticated: function($q, $http) {
            var deferred = $q.defer();
            $http.get('/api/v1/auth/isAuthenticated').then(function(response) {
              deferred.resolve(response.data.isAuthenticated);
            }, deferred.reject);
            return deferred.promise;
          }
        }
      }).
      state('root.anon', {
        url: '',
        templateUrl: '/main/anon/anon.html',
        controller: 'FrontPageCtrl',
        onEnter: function($state, isAuthenticated) {
          console.log('anon');
          if (isAuthenticated) {
            $state.go('root.auth');
          }
        },
        context: ''
      }).
      state('root.auth', {
        url: '',
        templateUrl: '/main/auth.html',
        controller: 'MainCtrl',
        context: '',
        resolve: {
          currentUser: resolveCurrentUserInfo.resolveUser,
          userBuckets: resolveCurrentUserInfo.resolveBuckets,
          userStreams: resolveCurrentUserInfo.resolveStreams
        },
        onEnter: function() {
          console.log('auth');
        }
      }).
      state('root.auth.gettingStarted', {
        url: 'getting-started',
        onEnter: function($state, $modal, currentUser) {
          if (currentUser.hasUsername() && currentUser.hasProfilePicture()) {
            return $state.transitionTo('main');
          }
          $modal.open({
            templateUrl: '/main/getting-started/getting-started.html',
            controller: 'GettingStartedCtrl',
            backdrop: 'static'
          }).result.then(function() {
              return $state.go('root');
            });
        },
        context: 'Getting Started'
      }).
      state('root.auth.settings', {
        url: 'settings',
        controller: 'SettingsCtrl',
        templateUrl: '/main/settings/settings.html',
        context: {
          name: 'Settings',
          icon: 'cog'
        }
      }).
      state('root.userPage', {
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
        onEnter: function(CurrentContext, profileUser) {
          CurrentContext.context({
            name: profileUser.getDisplayName(),
            icon: 'user',
            data: profileUser
          });
        }
      }).
      state('root.postStreamPage', {
        url: ':username/{type:stream|bucket}/:itemName',
        controller: 'PostStreamPageCtrl',
        abstract: true,
        templateUrl: '/main/post-stream-page/post-stream-page.html',
        resolve: {
          data: function loadStreamOrBucketPageData($q, $state, $stateParams, UtilService) {
            var deferred = $q.defer();
            var type = $stateParams.type;
            if (type.indexOf('s') > 3) {
              debugger;
            }
            UtilService.loadData(type, $stateParams.username, $stateParams.itemName).then(function(data) {
              if (data) {
                data.type = type;
                deferred.resolve(data);
              } else {
                deferred.reject('No ' + type);
                $state.go('root');
              }
            }, function(err) {
              deferred.reject(err);
              $state.go('root');
            });
            return deferred.promise;
          }
        },
        onEnter: function(CurrentContext, data) {
          var icon = 'bitbucket';
          if (data.type === 'stream') {
            icon = 'smile-o';
          }
          CurrentContext.context(data.thing.name, icon, data);
        }
      }).
      state('root.postStreamPage.bucket', {
        url: '',
        controller: 'BucketCtrl',
        templateUrl: '/main/buckets/bucket.html'
      }).
      state('root.postStreamPage.stream', {
        url: '',
        controller: 'StreamCtrl',
        templateUrl: '/main/streams/stream.html'
      }).
      state('root.postPage', {
        controller: 'PostPageCtrl',
        templateUrl: '/main/post-page/post-page.html',
        url: ':username/post/:postId',
        resolve: {
          post: function($q, UtilService, $stateParams) {
            var deferred = $q.defer();
            UtilService.loadPost($stateParams.postId).then(function(response) {
              deferred.resolve(response.data);
            }, deferred.reject);
            return deferred.promise;
          }
        },
        context: 'Bucket Streams Post'
      }).
      state('root.emailConfirmation', {
        controller: 'EmailConfirmationCtrl',
        templateUrl: '/main/email-confirmation/email-confirmation.html',
        url: 'confirm-email/:secret',
        resolve: {
          result: function($q, $http, $stateParams) {
            var deferred = $q.defer();
            $http.get('/api/v1/auth/confirm-email/' + $stateParams.secret).then(function(response) {
              deferred.resolve(response.data);
            }, deferred.reject);
            return deferred.promise;
          },
          code: function($stateParams) {
            return $stateParams.secret;
          }
        }
      }).
      state('root.resetPassword', {
        controller: 'ResetPasswordCtrl',
        templateUrl: '/main/reset-password/reset-password.html',
        url: 'reset-password/:secret',
        resolve: {
          user: function($q, $http, $stateParams) {
            var deferred = $q.defer();
            $http.get('/api/v1/auth/reset-password/' + $stateParams.secret).then(function(response) {
              deferred.resolve(new User(response.data.user));
            }, deferred.reject);
            return deferred;
          },
          code: function($http, $stateParams) {
            return $stateParams.secret;
          }
        }
      });

    $urlRouterProvider.otherwise('/');
  });

  app.run(function($rootScope, $state, bsGenie) {
//    $rootScope.$on('$stateChangeStart', function(event, to) {
//      if (to.name === 'root') {
//        
//      }
//      
//    });
    bsGenie.initializeGenie();
  });
//
//  app.run(function($rootScope, $state, $currentUser) {
//    $rootScope.$on('$stateChangeStart', function(e, to) {
//      if (!angular.isFunction(to.data.rule)) return;
//      var result = to.data.rule($currentUser);
//
//      if (result && result.to) {
//        e.preventDefault();
//        // Optionally set option.notify to false if you don't want 
//        // to retrigger another $stateChangeStart event
//        $state.go(to, result.params, {notify: false});
//      }
//    });
//  });

})();
