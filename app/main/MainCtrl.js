angular.module('bs.app').controller('MainCtrl', function($scope, _, $state, $window, $modal, currentUser, Stream, Bucket, Post, CurrentUserService, CurrentContext) {
  $scope.currentUser = currentUser;

  if (_.isUndefined($scope.currentUser.username)) {
    $state.transitionTo('home.gettingStarted');
    return;
  }

  $scope.$on(CurrentUserService.userUpdateEvent, function(event, user) {
    $scope.currentUser = user;
  });

  $scope.$on(CurrentContext.contextChangeEvent, function(event, newContext) {
    $scope.context = newContext;
  });
  $scope.context = CurrentContext.context();

  $scope.resetContext = function() {
    CurrentContext.context('Main Stream');
  };

  (function setupMenu() {

    // TODO Refactor the stream and bucket menu options. Abstract it a bit...
    function MenuItem(text, icon, onClick, children) {
      this.text = text;
      this.icon = icon;
      this.onClick = onClick;
      this.children = children;
    }

    function createThingMenuItems(type, icon) {
      var lType = type.toLowerCase();
      var newThing = new MenuItem('New ' + type, 'plus', function() {
        $state.go('home.newBucketOrStream', {type: lType});
      });

      var parentMenuItem = new MenuItem(type + 's', icon, null, [newThing]);

      function makeStreamMenuItems(things) {
        _.each(things, function(thing) {
          var params = {
            username: currentUser.username,
            itemName: thing.name,
            type: lType
          };
          parentMenuItem.children.push(new MenuItem(thing.name, null, function() {
            $state.go('home.postStreamPage.' + lType, params);
          }));
        });
      }
      var model = type === 'Bucket' ? Bucket : Stream;
      var scopeProp = 'user' + type + 's';
      $scope[scopeProp] = model.query({owner: currentUser._id});
      $scope[scopeProp].$promise.then(makeStreamMenuItems);
      return parentMenuItem;
    }

    var streamsMenuItem = createThingMenuItems('Stream', 'smile-o');
    var bucketsMenuItem = createThingMenuItems('Bucket', 'bitbucket');

    var settings = new MenuItem('Settings', 'gear', 'home.settings');
    $scope.menuItems = [streamsMenuItem, bucketsMenuItem, settings];

  })();

  (function setupPosting() {

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

  })();

});