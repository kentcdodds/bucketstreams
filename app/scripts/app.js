'use strict';

angular.module('bucketstreamsApp', [])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/:username/buckets/:id?', {
        templateUrl: 'views/buckets.html',
        controller: 'BucketCtrl'
      })
      .when('/:username/streams/:id?', {
        templateUrl: 'views/streams.html',
        controller: 'StreamCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
