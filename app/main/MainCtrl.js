angular.module('bs.app').controller('MainCtrl', function($scope, _, moment, $state, $window, currentUser, Stream, Post, CurrentUserService, CurrentContext) {
  $scope.currentUser = currentUser;

//  var daysSinceLastReminder = 100;
//  if ($scope.currentUser.setupReminderDate) {
//    daysSinceLastReminder = moment().diff($scope.currentUser.setupReminderDate, 'days');
//  }

  if (_.isUndefined($scope.currentUser.username)) {
    $state.transitionTo('home.gettingStarted');
//  } else if (daysSinceLastReminder > 1) {
//    var userFieldsToFill = _.find($scope.currentUser.getFieldsToFill(), {filledIn: false, dontRemind: false});
//    if (!userFieldsToFill || !userFieldsToFill.length) {
//      $state.transitionTo('home.gettingStarted');
//    }
  }

  $scope.$on(CurrentUserService.userUpdateEvent, function(event, user) {
    $scope.currentUser = user;
  });

  $scope.$on(CurrentContext.contextChangeEvent, function(event, newContext) {
    $scope.context = newContext;
  });

  CurrentContext.context('Main Stream');

  function MenuItem(text, icon, sref, children) {
    this.text = text;
    this.icon = icon;
    this.sref = sref;
    this.children = children;
  }

  var newStream = new MenuItem('New Stream', 'plus', 'home.newStream');
  var streams = new MenuItem('Streams', 'smile-o', null, [newStream]);

  var newBucket = new MenuItem('New Bucket', 'plus', 'home.newBucket');
  var buckets = new MenuItem('Buckets', 'bitbucket', null, [newBucket]);

  var settings = new MenuItem('Settings', 'gear', 'home.settings');
  $scope.menuItems = [streams, buckets, settings];

  $scope.mainStream = Stream.get({id: 'main'});
  $scope.mainStream.$promise.then(function(stream) {
    if (stream._id) {
      $scope.mainStream.getPostData().then(function(posts) {
        $scope.posts = posts;
      });
    }
  });

  $scope.removePost = function(post) {
    $scope.posts = $scope.posts || [];
    var index = $scope.posts.indexOf(post);
    if (index > -1) {
      $scope.posts.splice(index, 1);
    }
  };

  $scope.makePost = function(content) {
    var post = new Post({
      author: $scope.currentUser._id,
      content: [content],
      buckets: []
    });
    post.$save();
    $scope.posts.unshift(post);
  };

});