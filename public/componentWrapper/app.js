(function() {
  var thirdParties = ['ui.router', 'ui.bootstrap'];
  var angularMods = ['ngAnimate'];
  var internalMods = ['bs.directives', 'bs.models'];
  var app = angular.module('bs.componentWrapper', thirdParties.concat(angularMods.concat(internalMods)));

  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('home', {
        url: '/components',
        templateUrl: 'componentWrapper/index.html',
        controller: 'ComponentWrapperCtrl'
      });

    $urlRouterProvider.otherwise('/components');
  });

})();