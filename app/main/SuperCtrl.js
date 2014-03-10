angular.module('bs.app').controller('SuperCtrl', function($scope, _, $state, $window, $modal, $http, isAuthenticated, Stream, Bucket, Post, CurrentUserInfoService, AlertService, CurrentContext, CommonModalService, UtilService, genie, bsGenie) {
  $scope.isAuthenticated = isAuthenticated;
  $scope.currentUser = null;
  $scope.userBuckets = [];
  $scope.userStreams = [];

  $scope.$on(CurrentUserInfoService.events.user, function(event, user) {
    $scope.currentUser = user;
    if (user) {
      $scope.isAuthenticated = true;
      setupUserStuff();
    }
  });
  
  var setupBucketsMenuItems = function(){};
  var setupStreamsMenuItems = function(){};

  $scope.$on(CurrentUserInfoService.events.buckets, function(event, buckets) {
    $scope.userBuckets = buckets;
    setupBucketsMenuItems();
  });

  $scope.$on(CurrentUserInfoService.events.streams, function(event, streams) {
    $scope.userStreams = streams;
    setupStreamsMenuItems();
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
    $scope.lamp.input = $scope.context.name;
  });
  $scope.context = CurrentContext.context();

  $scope.resetContext = function() {
    CurrentContext.context('');
  };

  function menuItemAction(wish) {
    if (_.isString(wish.data.menuItem.onClick)) {
      $state.go(wish.data.menuItem.onClick);
    } else {
      wish.data.menuItem.onClick();
    }
  }

  function setupMenu() {

    function MenuItem(text, icon, onClick, genieIcon, children) {
      this.text = text;
      this.icon = icon;
      this.onClick = onClick;
      this.genieIcon = genieIcon || icon;
      this.children = children;
    }

    function createWish(menuItem, id) {
      var data = bsGenie.getUxDataForIcon(menuItem.genieIcon);
      data.menuItem = menuItem;
      return genie({
        id: id || 'mi-' + menuItem.genieIcon + menuItem.text.toLowerCase().replace(/ /g, '-'),
        context: bsGenie.appContext,
        magicWords: menuItem.text,
        data: data,
        action: menuItemAction
      });
    }
    // creates a scope variable with the name: userTypes (ie userBuckets)
    function createThingMenuItems(type, icon) {
      var lType = type.toLowerCase();
      var scopeProp = 'user' + type + 's';
      var newThing = new MenuItem('New ' + type, 'plus', function() {
        CommonModalService.createOrEditBucketStream(lType).result.then(function(newThing) {
          CurrentUserInfoService['refresh' + type + 's']();
          if (newThing) {
            $scope[scopeProp].unshift(newThing);
            $state.go('root.postStreamPage.' + lType, {
              username: $scope.currentUser.username,
              itemName: newThing.name,
              type: lType 
            });
          }
        });
      });
      createWish(newThing, 'create-new-' + lType);

      var parentMenuItem = new MenuItem(type + 's', icon, null, null, [newThing]);

      function makeStreamMenuItems(things) {
        _.each(things, function(thing) {
          var params = {
            username: $scope.currentUser.username,
            itemName: thing.name,
            type: lType
          };
          var thingMenuItem = new MenuItem(thing.name, null, function() {
            $state.go('root.postStreamPage.' + lType, params);
          }, icon);
          parentMenuItem.children.push(thingMenuItem);
          createWish(thingMenuItem);
        });
      }
      $scope[scopeProp].$promise.then(makeStreamMenuItems);
      return parentMenuItem;
    }

    setupStreamsMenuItems = function() {
      $scope.menuItems[1] = createThingMenuItems('Stream', 'smile-o');
    };

    setupBucketsMenuItems = function() {
      $scope.menuItems[2] = createThingMenuItems('Bucket', 'bitbucket');
    };

    var settings = new MenuItem('Settings', 'gear', 'root.auth.settings');
    var feedback = new MenuItem('Send Feedback', 'bullhorn', function() {
      $window.open('https://bitbucket.org/kentcdodds/bucketstreams/issues/new');
    });

    var search = new MenuItem('Search', 'search', function() {
      $scope.lampVisible = true;
      $scope.$safeApply();
    });

    $scope.menuItems = [search, null, null, settings, feedback];
  }

  function setupUserStuff() {
      setupMenu();
      
      if ($scope.currentUser.username) {
        UtilService.loadData('stream', currentUser.username, 'Main Stream').then(function(data) {
          $scope.mainStreamData = data;
        });
      }
  
  }
  if ($scope.currentUser && $scope.isAuthenticated) {
    setupUserStuff();
  }
  
  (function setupLamp() {
    $scope.lamp = {
      wishMade: function() {
      },
      visible: false,
      input: (CurrentContext.context() || {name: ''}).name
    };
  })();


});