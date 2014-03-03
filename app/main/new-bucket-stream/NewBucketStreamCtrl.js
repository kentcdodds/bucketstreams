angular.module('bs.app').controller('NewBucketStreamCtrl', function($scope, $state, model, type, currentUser, Bucket, Stream, AlertService) {
  $scope.type = type;
  $scope.newThing = new model({
    owner: currentUser._id
  });

  $scope.onCancel = function() {
    $scope.$close();
    $state.go('home');
  };

  $scope.onSubmit = function() {
    $scope.newThing.$save(function() {
      AlertService.success('Awesome, created "' + $scope.newThing.name + '" ' + type);
      $scope.$close();
      $state.go('home.postStreamPage.' + type, {
        username: currentUser.username,
        itemName: $scope.newThing.name,
        type: type
      });
    }, AlertService.handleErrorResponse);
  }
});