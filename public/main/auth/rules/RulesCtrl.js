angular.module('bs.app').controller('RulesCtrl', function($scope) {
  $scope.outboundRules = $scope.currentUser.rules;
  $scope.connectedAccounts = $scope.currentUser.connectedAccounts;
});