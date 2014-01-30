'use strict';

(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'pasvaz.bindonce'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives'];
  var app = angular.module('bs.frontPage', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('anon', {
        url: '/',
        templateUrl: 'front-page/index.html',
        controller: 'MainCtrl',
        onEnter: function() {
          console.log('anon');
        }
      })
      .state('anon.signup', {
        url: 'signup',
        templateUrl: 'front-page/signup.html',
        controller: 'RegistrationCtrl',
        onEnter: function() {
          console.log('anon.signup');
        }
      })
      .state('anon.login', {
        url: 'login',
        templateUrl: 'front-page/login.html',
        controller: 'LoginCtrl',
        onEnter: function() {
          console.log('anon.login');
        }
      });

    $urlRouterProvider.otherwise('/');
  });
})();
