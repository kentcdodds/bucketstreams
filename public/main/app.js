(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'angularFileUpload', 'uxGenie', 'Scope.safeApply'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives', 'bs.models', 'bs.services', 'bs.filters'];
  var app = angular.module('bs.app', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, _) {
    $locationProvider.html5Mode(true);

    var resolveCurrentUserInfo = {};
    _.each(['User', 'Buckets', 'Streams'], function(thing) {
      resolveCurrentUserInfo['resolve' + thing] = function(CurrentUserInfoService, isAuthenticated) {
        if (!isAuthenticated) return null;
        var thingVal = CurrentUserInfoService['get' + thing]();
        if (_.isEmpty(thingVal)) {
          thingVal = CurrentUserInfoService['refresh' + thing]();
        }
        if (thingVal.hasOwnProperty('$resolved')) {
          if (thingVal.$resolved) {
            return thingVal;
          } else {
            return thingVal.$promise;
          }
        } else {
          return thingVal;
        }
      }
    });
    
    var usernameUrl = '{username:(?:[a-zA-Z]|_|\\d){3,16}}';

    $stateProvider.
      state('root', {
        abstract: true,
        templateUrl: '/main/index.html',
        controller: 'SuperCtrl',
        url: '/',
        resolve: {
          isAuthenticated: function(CurrentUserInfoService) {
            return CurrentUserInfoService.refreshAuthenticated();
          },
          currentUser: resolveCurrentUserInfo.resolveUser,
          userBuckets: resolveCurrentUserInfo.resolveBuckets,
          userStreams: resolveCurrentUserInfo.resolveStreams
        }
      }).
      state('root.anon', {
        url: '',
        templateUrl: '/main/anon/anon.html',
        controller: 'FrontPageCtrl'
      }).
      state('root.anon.trouble', {
        url: 'login-trouble',
        templateUrl: '/main/anon/login-trouble.html',
        controller: 'LoginTroubleCtrl'
      }).
      state('root.auth', {
        abstract: true,
        url: '',
        template: '<div ui-view></div>'
      }).
      state('root.auth.home', {
        url: '',
        templateUrl: '/main/auth/home.html',
        controller: 'MainCtrl',
        resolve: {
          mainStreamData: function(UtilService, currentUser) {
            if (currentUser.hasUsername) {
              return UtilService.loadData('stream', currentUser.username, 'Main Stream');
            } else {
              return [];
            }
          }
        },
        onEnter: function() {
          console.log('root.auth.home');
        },
        context: ''
      }).
      state('root.auth.settings', {
        url: 'settings',
        controller: 'SettingsCtrl',
        templateUrl: '/main/auth/settings/settings.html',
        context: {
          name: 'Settings',
          icon: 'cog'
        },
        onEnter: function() {
          console.log('root.settings');
        }
      }).
      state('root.userPage', {
        url: usernameUrl,
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
        url: usernameUrl + '/{type:stream|bucket}/:itemName',
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
                $state.go('root.auth.home');
              }
            }, function(err) {
              deferred.reject(err);
              $state.go('root.auth.home');
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
        url: usernameUrl + '/post/:postId',
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
        templateUrl: '/main/auth/email-confirmation/email-confirmation.html',
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
      state('root.sendResetPasswordEmail', {
        controller: 'ResetPasswordCtrl',
        templateUrl: '/main/reset-password/reset-password.html',
        url: 'reset-password/:secret',
        resolve: {
          data: function($q, $http, $stateParams, User) {
            var deferred = $q.defer();
            $http.get('/api/v1/auth/reset-password/' + $stateParams.secret).then(function(response) {
              deferred.resolve({
                result: response.data.result,
                user: new User(response.data.user)
              });
            }, deferred.reject);
            return deferred.promise;
          },
          code: function($http, $stateParams) {
            return $stateParams.secret;
          }
        }
      });

    $urlRouterProvider.otherwise('/');
    
  });
  
  app.run(function($rootScope, $state, CurrentUserInfoService) {
    $rootScope.$on(CurrentUserInfoService.events.user, function(event, user) {
      if (!user && /root\.auth/.test($state.current.name)) {
        $state.go('root.anon');
      }
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      console.log(toState.name);
      var authenticated = CurrentUserInfoService.getAuthenticated();
      if (/root\.auth/.test(toState.name)) {
        if (!authenticated) {
          $state.go('root.anon');
        }
      } else if ('root.anon' === toState.name) {
        if (authenticated) {
          $state.go('root.auth.home');
        }
      }
    });
  });
})();
