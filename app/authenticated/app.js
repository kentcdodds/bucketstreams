'use strict';

(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'pasvaz.bindonce'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives'];
  var app = angular.module('bs.app', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/authenticated/index.html',
        controller: 'MainCtrl',
        onEnter: function() {
          console.log('anon');
        }
      });

    $urlRouterProvider.otherwise('/');
  });
})();
