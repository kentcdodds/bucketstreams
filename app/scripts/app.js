'use strict';

(function() {
  var app = angular.module('bucketstreamsApp', ['ui.router', 'ui.bootstrap']);

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .state('main.test', {
        template: '<div><h2>I\'m here!</h2></div>',
        url: '/here'
      });

  });
})();
