'use strict';

(function() {
  var app = angular.module('bsApp', ['ngAnimate', 'ui.router', 'ui.bootstrap', 'pasvaz.bindonce']);

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('anon', {
        url: '/',
        templateUrl: 'scripts/components/home/index.html',
        controller: 'MainCtrl',
        onEnter: function() {
          console.log('anon');
        }
      })
      .state('anon.signup', {
        url: 'signup',
        templateUrl: 'scripts/components/home/signup.html',
        controller: 'RegistrationCtrl',
        onEnter: function() {
          console.log('anon.signup');
        }
      })
      .state('anon.login', {
        url: 'login',
        templateUrl: 'scripts/components/home/login.html',
        controller: 'LoginCtrl',
        onEnter: function() {
          console.log('anon.login');
        }
      })
      .state('components', {
        url: '/components',
        templateUrl: 'componentWrapper/componentWrapper.html',
        controller: 'ComponentWrapperCtrl',
        onEnter: function() {
          console.log('components');
        }
      });
  });
})();
