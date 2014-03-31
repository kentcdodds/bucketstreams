angular.module('bs.web.app').controller('SuperCtrl', function($scope, _, $state, $window, $modal, $http, isAuthenticated, currentUser, userBuckets, userStreams, CurrentUserInfoService, CurrentContext, bsMenuService, CommonModalService, UtilService, genie, bsGenie) {
  $scope.isAuthenticated = isAuthenticated;
  $scope.currentUser = currentUser;
  $scope.userBuckets = userBuckets;
  $scope.userStreams = userStreams;
  $scope.menuItems = bsMenuService.menuItems;

  $scope.$on('$stateChangeSuccess', function(event, to) {
    $scope.onFrontPage = to.name === 'root.anon';
  });

  if ($state.current.name === 'root.anon') {
    $scope.onFrontPage = true;
  }

  $scope.$on(CurrentUserInfoService.events.user, function(event, user) {
    $scope.currentUser = user;
    if (user) {
      $scope.isAuthenticated = true;
      if (!menuSetup) {
        setupMenu();
        menuSetup = true;
      }
    }
  });

  var setupMenuItemsFor = function(){};

  $scope.$on(CurrentUserInfoService.events.buckets, function(event, buckets) {
    $scope.userBuckets = buckets;
    setupMenuItemsFor('Buckets');
  });

  $scope.$on(CurrentUserInfoService.events.streams, function(event, streams) {
    $scope.userStreams = streams;
    setupMenuItemsFor('Streams');
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
    function createThingMenuItems(type, icon) {
      var typeNoS = type.substring(0, type.length - 1);
      var lType = typeNoS.toLowerCase();
      var scopeProp = 'user' + type;
      var newThing = new bsMenuService.MenuItem('New ' + typeNoS, 'plus', function() {
        CommonModalService.createOrEditBucketStream(lType).result.then(function(newThing) {
          CurrentUserInfoService['refresh' + type]();
          if (newThing) {
            $scope[scopeProp].unshift(newThing);
            $state.go('root.postStreamPage', {
              username: $scope.currentUser.username,
              itemName: newThing.name,
              type: lType
            });
          }
        });
      });
      createWish(newThing, 'create-new-' + lType);

      var parentMenuItem = new bsMenuService.MenuItem(type, icon, null, null, [newThing]);

      function makeStreamMenuItems(things) {
        _.each(things, function(thing) {
          var params = {
            username: $scope.currentUser.username,
            itemName: thing.name,
            type: lType
          };
          var thingMenuItem = new bsMenuService.MenuItem(thing.name, null, function() {
            $state.go('root.postStreamPage', params);
          }, icon);
          parentMenuItem.children.push(thingMenuItem);
          createWish(thingMenuItem);
        });
      }
      if ($scope[scopeProp] && $scope[scopeProp].hasOwnProperty('$resolved')) {
        if ($scope[scopeProp].$resolved) {
          makeStreamMenuItems($scope[scopeProp]);
        } else {
          $scope[scopeProp].$promise.then(makeStreamMenuItems);
        }
      }
      return parentMenuItem;
    }

    setupMenuItemsFor = function(thing) {
      var index = 3;
      var icon = 'smile-o';
      if (thing === 'Buckets') {
        index = 4;
        icon = 'bitbucket';
      }
      bsMenuService.menuItems[index] = createThingMenuItems(thing, icon);
    };
    setupMenuItemsFor('Streams');
    setupMenuItemsFor('Buckets');

    bsMenuService.menuItems[5] = new bsMenuService.MenuItem('Rules', 'facebook', 'root.auth.thirdParties');
    bsMenuService.menuItems[10] = new bsMenuService.MenuItem('Settings', 'gear', 'root.auth.settings');
    bsMenuService.menuItems[11] = new bsMenuService.MenuItem('Send Feedback', 'bullhorn', function() {
      $window.open('https://bitbucket.org/kentcdodds/bucketstreams/issues/new');
    });
  }

  var menuSetup = false;
  if ($scope.isAuthenticated) {
    setupMenu();
    menuSetup = true;
  }

  $scope.showNewPostModal = function() {
    CommonModalService.createOrEditPost($scope.currentUser, $scope.userBuckets);
  };


  // initialize lamp
  $scope.lamp = {
    wishMade: function() {
    },
    visible: false,
    input: (CurrentContext.context() || {name: ''}).name
  };
  bsGenie.initializeGenie();
  


});