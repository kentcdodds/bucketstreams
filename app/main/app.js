(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'pasvaz.bindonce', 'angularFileUpload'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives', 'bs.models', 'bs.services'];
  var app = angular.module('bs.app', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('home', {
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
      })
      .state('home.gettingStarted', {
        url: 'getting-started',
        onEnter: function($state, $modal, CurrentUserService) {
          var currentUser = CurrentUserService.getUser();
          if (currentUser.hasUsername() && currentUser.hasProfilePicture()) {
            return $state.transitionTo('home');
          }
          $modal.open({
            templateUrl: '/main/getting-started/index.html',
            controller: 'GettingStartedCtrl',
            backdrop: 'static'
          }).result.then(function() {
              return $state.transitionTo('home');
            });
        }
      })
      .state('home.userPage', {
        url: ':username',
        onEnter: function($stateParams) {
          console.log($stateParams);
        }
      });

    $urlRouterProvider.otherwise('/');
  });
})();
