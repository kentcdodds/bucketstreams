angular.module('bs.app').controller('GettingStartedCtrl', function($scope, _, UtilService, CurrentUser, AlertService, $http) {
  $scope.currentUser = CurrentUser;
  $scope.fieldsToFill = $scope.currentUser.getFieldsToFill();
  $scope.dismiss = function() {
    $scope.currentUser.setupReminderDate = new Date();
    $scope.currentUser.$save();
    $scope.$close();
  };

  $scope.dontRemind = function($event, field) {
    if (field.dontRemind) {
      _.remove($scope.currentUser.dontRemind, function(item) {
        return item === field.displayName;
      });
    } else {
      $scope.currentUser.dontRemind.push(field.displayName);
    }
    field.dontRemind = !field.dontRemind;
    $scope.currentUser.$save();

    if ($event.stopPropagation) $event.stopPropagation();
    if ($event.preventDefault) $event.preventDefault();
    $event.cancelBubble = true;
    $event.returnValue = false;
  };

  $scope.checkUniqueUsername = _.debounce(function() {
//    $http TODO: Check with the server here!
  }, 500);

  var saveUser = _.debounce(function() {
    $scope.currentUser.$save(function() {
      AlertService.success('Saved');
    }, function(err) {
      AlertService.error('Error Saving: ' + err.message);
    });
  }, 750);

  $scope.onFormUpdate = function(form) {
    if (!form.$invalid) {
      saveUser();
    }
  };
});