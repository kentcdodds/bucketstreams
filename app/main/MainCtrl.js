angular.module('bs.app').controller('MainCtrl', function($scope, _, $state, $window, $modal, currentUser, Stream, Bucket, Post, CurrentUserService, CurrentContext, CommonModalService, UtilService) {
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

    // Select the bucket in context
    var id = null;
    if ($scope.context.data && $scope.context.data.bucket) {
      id = $scope.context.data.bucket._id;
    }
    _.each($scope.userBuckets, function(bucket) {
      bucket.selected(id === bucket._id);
    });
  });
  $scope.context = CurrentContext.context();

  $scope.resetContext = function() {
    CurrentContext.context('Main Stream');
  };

  (function setupMenu() {

    function MenuItem(text, icon, onClick, children) {
      this.text = text;
      this.icon = icon;
      this.onClick = onClick;
      this.children = children;
    }

    // creates a scope variable with the name: userTypes (ie userBuckets)
    function createThingMenuItems(type, icon) {
      var lType = type.toLowerCase();
      var model = type === 'Bucket' ? Bucket : Stream;
      var scopeProp = 'user' + type + 's';
      var newThing = new MenuItem('New ' + type, 'plus', function() {
        CommonModalService.newBucketStream(lType).result.then(function(newThing) {
          if (newThing) {
            $scope[scopeProp].unshift(newThing);
            $state.go('home.postStreamPage.' + lType, {
              username: currentUser.username,
              itemName: newThing.name,
              type: lType
            });
          }
        });
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
      $scope[scopeProp] = model.query({owner: currentUser._id});
      $scope[scopeProp].$promise.then(makeStreamMenuItems);
      return parentMenuItem;
    }

    var streamsMenuItem = createThingMenuItems('Stream', 'smile-o');
    var bucketsMenuItem = createThingMenuItems('Bucket', 'bitbucket');

    var settings = new MenuItem('Settings', 'gear', 'home.settings');
    var feedback = new MenuItem('Send Feedback', 'bullhorn', function() {
      $window.open('https://bitbucket.org/kentcdodds/bucketstreams/issues/new');
    });

    var search = new MenuItem('Search', 'search', function() {
      $scope.lampVisible = true;
      $scope.$safeApply();
    });
    $scope.$watch('lampVisible', function() {
      console.log(arguments);
    });


    $scope.menuItems = [search, streamsMenuItem, bucketsMenuItem, settings, feedback];
  })();

  UtilService.loadData('bucket', currentUser.username, 'Main Bucket').then(function(data) {
    $scope.mainBucketData = data;
  });

});