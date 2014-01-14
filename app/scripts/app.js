'use strict';

(function() {
  var app = angular.module('bucketstreamsApp', ['ngAnimate', 'ui.router', 'ui.bootstrap']);

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
      .state('component', {
        url: '/component',
        templateUrl: '/scripts/components/wrapper/index.html',
        onEnter: function() {
          console.log('component');
        }
      })
      .state('component.post', {
        url: '/post',
        templateUrl: '/scripts/components/post/post.html',
        controller: 'PostCtrl',
        onEnter: function() {
          console.log('component.post');
        }

      });
  });
})();
