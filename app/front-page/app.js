'use strict';

(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'pasvaz.bindonce'];
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
          console.log('frontPage');
        }
      }).
      state('frontPage.signup', {
        url: 'signup',
        templateUrl: frontPageTemplates + 'signup.html',
        controller: 'SignUpCtrl',
        onEnter: function() {
          console.log('frontPage.signup');
        }
      }).
      state('frontPage.login', {
        url: 'login',
        templateUrl: frontPageTemplates + 'login.html',
        controller: 'LoginCtrl',
        onEnter: function() {
          console.log('frontPage.login');
        }
      }).
      state('frontPage.facebook', {
        url: 'facebook',
        templateUrl: frontPageTemplates + 'interest-game/game.html',
        controller: 'GameCtrl',
        onEnter: function() {
          console.log('frontPage')
        }
      }).
      state('frontPage.interestGame', {
        url: 'interest',
        templateUrl: frontPageTemplates + 'interest-game/index.html',
        controller: 'GameCtrl',
        onEnter: function() {
          console.log('frontPage.interestGame');
        }
      }).
      state('frontPage.interestGame.game', {
        url: '{facebook|twitter|google}',
        templateUrl: frontPageTemplates + 'interest-game/game.html',
        controller: 'GameCtrl',
        onEnter: function() {
          console.log('frontPage.interestGame.game');
        }
      });

//    $urlRouterProvider.otherwise('/');
  });
})();
