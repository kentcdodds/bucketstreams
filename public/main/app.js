(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'angularFileUpload', 'uxGenie', 'infinite-scroll', 'angular-google-analytics'];
  var angularMods = ['ngAnimate'];
  var commonMods = ['bs.common'];
  var internalMods = ['bs.web.constants', 'bs.web.directives', 'bs.web.services'];
  var app = angular.module('bs.web.app', thirdParties.concat(angularMods.concat(commonMods)).concat(internalMods));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, _, AnalyticsProvider) {
    // Analytics setup
    // initial configuration
    AnalyticsProvider.setAccount('UA-46959103-2');

    // track all routes (or not)
    AnalyticsProvider.trackPages(true);

    //Optional set domain (Use 'none' for testing on localhost)
    AnalyticsProvider.setDomainName(window.BS.BASE_URL);

    // change page event name
    AnalyticsProvider.setPageEvent('$stateChangeSuccess');

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

    function resolveParameter(param) {
      return function($stateParams) {
        return $stateParams[param];
      }
    }
    
    var usernameUrl = '{username:(?:[a-zA-Z]|_|\\d){3,16}}';

    $stateProvider.
      state('root', {
        abstract: true,
        templateUrl: '/main/index.html',
        controller: 'SuperCtrl',
        url: '/',
        resolve: {
          isAuthenticated: function() {
            return !!localStorage.getItem('user-token');
          },
          currentUser: resolveCurrentUserInfo.resolveUser,
          userBuckets: resolveCurrentUserInfo.resolveBuckets,
          userStreams: resolveCurrentUserInfo.resolveStreams
        }
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
            if (currentUser && currentUser.hasUsername) {
              return UtilService.loadData('stream', currentUser.username, 'Main Stream', {
                skip: 0,
                limit: 14
              });
            } else {
              return {};
            }
          }
        },
        onEnter: function() {
          console.log('on-enter root.auth.home');
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
          console.log('on-enter root.settings');
        }
      }).
      state('root.auth.thirdParties', {
        url: 'rules',
        controller: 'RulesCtrl',
        templateUrl: '/main/auth/rules/rules.html',
        context: {
          name: 'Rules'
        },
        onEnter: function() {
          console.log('on-enter root.auth.thirdParties');
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
      state('root.userPage', {
        url: usernameUrl,
        controller: 'ProfileCtrl',
        templateUrl: '/main/profile/profile.html',
        resolve: {
          username: resolveParameter('username'),
          profileUser: function($q, username, User, _) {
            var deferred = $q.defer();
            if (username === 'unknown_user') {
              deferred.resolve(new User({
                username: username,
                name: {
                  first: 'Unknown',
                  last: 'User'
                },
                tagline: 'I am a system user. I\'m not real. Move along :-)'
              }));
            } else {
              User.query({username: username}).$promise.then(function(data) {
                if (_.isEmpty(data)) {
                  deferred.reject('No user with the username ' + username);
                } else {
                  deferred.resolve(data[0]);
                }
              }, deferred.reject);
            }
            return deferred.promise;
          },
          buckets: function(Bucket, username) {
            if (username === 'unknown_user') return [];
            return Bucket.query({username: username});
          },
          streams: function(Stream, username) {
            if (username === 'unknown_user') return [];
            return Stream.query({username: username});
          },
          mainBucketData: function(UtilService, username) {
            if (username === 'unknown_user') return {};
            return UtilService.loadData('bucket', username, 'Main Bucket', {
              skip: 0,
              limit: 14
            });
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
        templateUrl: '/main/post-stream-page/post-stream-page.html',
        resolve: {
          data: function loadStreamOrBucketPageData($q, $state, $stateParams, UtilService) {
            var deferred = $q.defer();
            var type = $stateParams.type;
            UtilService.loadData(type, $stateParams.username, $stateParams.itemName, {
              skip: 0,
              limit: 14
            }).then(function(data) {
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
      state('root.postPage', {
        controller: 'PostPageCtrl',
        templateUrl: '/main/post-page/post-page.html',
        url: 'post/:postId',
        resolve: {
          post: function(UtilService, $stateParams) {
            return UtilService.loadPost($stateParams.postId);
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
          code: resolveParameter('secret')
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
          code: resolveParameter('secret')
        }
      }).
      state('root.providerCallback', {
        url: 'third-party/:provider/confirm',
        resolve: {
          code: function($state, $stateParams, $window, $location, UtilService, AlertEventBroadcaster) {
            var query = $location.search();
            if (query.code || query['oauth_token']) {
              UtilService.callbackProvider($stateParams.provider, query).then(function() {
                AlertEventBroadcaster.broadcast({
                  message: 'Connected with ' + $stateParams.provider + ' successfully',
                  type: 'success'
                });
                var destination = sessionStorage.getItem('destination');
                if (destination) {
                  sessionStorage.removeItem('destination');
                  $window.location.href = destination;
                } else {
                  $state.go('root.anon');
                }
              }, function(err) {
                AlertEventBroadcaster.broadcast({
                  message: err.message || err,
                  type: 'error'
                });
                $state.go('root.anon');
              });
            } else {
              $state.go('root.anon');
            }
          }
        }
      })
      .state('error', {
        url: '/error',
        template: '<div class="text-align-center margin-xxlarge">' +
          '<h1>Whoops!</h1>' +
          '<div>Something weird happened... It is alpha, after all...</div>' +
          '</div>'
      });

    $urlRouterProvider.otherwise('/');
    
  });
  
  app.run(function($rootScope, $state, CurrentUserInfoService, AlertEventBroadcaster, $location, $window, UtilService, Analytics) {
    var alertEvents = [
      { name: '$stateChangeError', type: 'error', message: 'Something weird happened. Try refreshing...' }
    ];
    AlertEventBroadcaster.initialize(alertEvents);
    $rootScope.$on(CurrentUserInfoService.events.user, function(event, user) {
      if (!user && /root\.auth/.test($state.current.name)) {
        $state.go('root.anon');
      }
    });
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      console.log(toState.name);
      var authenticated = !!localStorage.getItem('user-token');
      if (/root\.auth/.test(toState.name)) {
        if (!authenticated) {
          event.preventDefault();
          $state.go('root.anon');
        }
      } else if ('root.anon' === toState.name) {
        if (authenticated) {
          event.preventDefault();
          $state.go('root.auth.home');
        }
      }
    });
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
      console.error('$stateChangeError');
      console.error(event);
      $window.BS.stateChangeErrors = $window.BS.stateChangeErrors || 1;
      $window.BS.stateChangeErrors++;
      if ($window.BS.stateChangeErrors > 10) {
        $state.go('error');
        $window.localStorage.removeItem('user-token');
      } else {
        $state.go('root.anon');
      }
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      $window.BS.stateChangeErrors = 0;
      var provider = $location.search()['import-profile-photo'];
      if (provider) {
        UtilService.importProfilePhoto(provider);
      }
    });
  });
})();
