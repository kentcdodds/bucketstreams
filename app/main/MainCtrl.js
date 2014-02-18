angular.module('bs.app').controller('MainCtrl', function($scope, _, moment, $state, $window, currentUser, Stream, Post, CurrentUserService, CurrentContext) {
  $scope.currentUser = currentUser;

  $scope.signOut = function() {
    $window.location.href = '/auth/logout';
  };

  var daysSinceLastReminder = 100;
  if ($scope.currentUser.setupReminderDate) {
    daysSinceLastReminder = moment().diff($scope.currentUser.setupReminderDate, 'days');
  }

  if (_.isUndefined($scope.currentUser.username)) {
    $state.transitionTo('home.gettingStarted');
  } else if (daysSinceLastReminder > 1) {
    var userFieldsToFill = _.find($scope.currentUser.getFieldsToFill(), {filledIn: false, dontRemind: false});
    if (!userFieldsToFill || !userFieldsToFill.length) {
      $state.transitionTo('home.gettingStarted');
    }
  }

  $scope.$on(CurrentUserService.userUpdateEvent, function(event, user) {
    $scope.currentUser = user;
  });

  $scope.$on(CurrentContext.contextChangeEvent, function(event, newContext) {
    $scope.context = newContext;
  });

  CurrentContext.context('Main Stream');

  $scope.mainStream = Stream.get({id: 'main'});
  $scope.mainStream.$promise.then(function(stream) {
    if (stream._id) {
      $scope.mainStream.getPosts().then(function(response) {
        $scope.posts = response.data;
      });
    }
  });

  $scope.makePost = function(content) {
    var post = new Post({
      author: $scope.currentUser._id,
      content: content,
      buckets: []
    });
    post.$save();

  };

});