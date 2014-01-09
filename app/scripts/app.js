'use strict';

(function() {
  var app = angular.module('bucketstreamsApp', ['ui.router', 'ui.bootstrap']);

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('anon', {
        url: '/',
        templateUrl: '/views/anon.html',
        controller: 'MainCtrl'
      })
      .state('anon.signup', {
        url: 'signup',
        templateUrl: '/views/anon.signup.html'
      });

  });
  app.run(function($state){
    var href = $state.href('anon.home');
    console.log(href);
  });
})();
