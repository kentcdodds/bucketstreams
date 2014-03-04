'use strict';

(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives', 'bs.models', 'bs.services'];
  var app = angular.module('bs.frontPage', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    var frontPageTemplates = 'front-page/';

    $stateProvider.
      state('frontPage', {
        url: '/',
        templateUrl: frontPageTemplates + 'index.html',
        controller: 'FrontPageCtrl',
        onEnter: function() {
        }
      }).
      state('frontPage.loginTrouble', {
        url: 'login-trouble',
        templateUrl: frontPageTemplates + 'login-trouble.html',
        controller: function($scope) {
          $scope.message = 'Too bad...';
        },
        onEnter: function() {
        }
      });

    $urlRouterProvider.otherwise('/');
  });
})();
