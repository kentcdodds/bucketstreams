angular.module('bs.app').controller('RulesCtrl', function($scope, $window, $location, AlertService, CommonModalService) {
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

  $scope.toggle = function(provider) {
    if (provider.isConnected) {
      CommonModalService.confirm({
        header: 'Disconnect ' + provider.display,
        message: 'This will not remove any posts on Bucket Streams that were imported from ' + provider.display +
          ' and it wont delete rules associated with ' + provider.display +
          ', but Bucket Streams will no longer be able to import or export posts to or from ' + provider.display + '.',
        yesButton: 'I\'m sure',
        cancelButton: 'Never mind'
      }).result.then(function() {
        provider.isConnected = false;
        $scope.currentUser.disconnectFrom(provider.name).then(function() {
          AlertService.info('Disconnected ' + provider.display);
        }, function error(err) {
          AlertService.error('Problem disconnecting ' + provider.display);
          provider.isConnected = true;
        });
      });
    } else {
      $window.location.href = '/third-party/' + provider.name + '?destination=' + encodeURIComponent($location.path());
    }
  };
});