angular.module('bs.app').controller('RulesCtrl', function($scope, $window) {
  $scope.outboundRules = $scope.currentUser.rules;
  $scope.connectedAccounts = $scope.currentUser.connectedAccounts;
  $scope.providers = [
    { icon: 'facebook', name: 'facebook', display: 'Facebook' },
    { icon: 'twitter', name: 'twitter', display: 'Twitter' },
    { icon: 'google-plus', name: 'google', display: 'Google+' }
  ];
  _.each($scope.providers, function(provider) {
    provider.isConnected = $scope.currentUser.isConnectedTo(provider.name);
  });
  $scope.connect = function(provider) {
    $window.open('/third-party/' + provider);
  }

});