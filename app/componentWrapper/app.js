(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap', 'pasvaz.bindonce'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives'];
  var app = angular.module('bs.componentWrapper', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('home', {
        url: '/components',
        templateUrl: 'componentWrapper/index.html',
        controller: 'ComponentWrapperCtrl',
        onEnter: function() {
          console.log('component wrapper');
        }
      });

    $urlRouterProvider.otherwise('/components');
  });

})();