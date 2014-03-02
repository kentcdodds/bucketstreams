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

  CurrentContext.context('Main Stream');

  (function setupMenu() {

    // TODO Refactor the stream and bucket menu options. Abstract it a bit...
    function MenuItem(text, icon, onClick, children) {
      this.text = text;
      this.icon = icon;
      this.onClick = onClick;
      this.children = children;
    }

    var newStream = new MenuItem('New Stream', 'plus', function() {
      $modal.open({
        templateUrl: '/main/new-stream/new-stream.html',
        controller: 'NewStreamCtrl',
        resolve: {
          currentUser: function() {
            return $scope.currentUser;
          }
        }
      }).result.then(function(stream) {
          $scope.userStreams.unshift(stream);
          streamsMenuItem.children = [newStream];
          makeStreamMenuItems($scope.userStreams);
        });
    });

    var streamsMenuItem = new MenuItem('Streams', 'smile-o', null, [newStream]);

    function makeStreamMenuItems(streams) {
      _.each(streams, function(stream) {
        var params = {
          username: currentUser.username,
          itemName: stream.name,
          type: 'stream'
        };
        streamsMenuItem.children.push(new MenuItem(stream.name, null, function() {
          $state.go('home.postStreamPage.stream', params);
        }));
      });
    }
    $scope.userStreams = Stream.query({owner: currentUser._id});
    $scope.userStreams.$promise.then(makeStreamMenuItems);


    var newBucket = new MenuItem('New Bucket', 'plus', function() {
      $modal.open({
        templateUrl: '/main/new-bucket/new-bucket.html',
        controller: 'NewBucketCtrl',
        resolve: {
          currentUser: function() {
            return $scope.currentUser;
          }
        }
      }).result.then(function(bucket) {
          $scope.userBuckets.unshift(bucket);
          bucketsMenuItem.children = [newBucket];
          makeBucketMenuItems($scope.userBuckets);
        });
    });

    function makeBucketMenuItems(buckets) {
      _.each(buckets, function(bucket) {
        var params = {
          username: currentUser.username,
          itemName: bucket.name,
          type: 'bucket'
        };
        bucketsMenuItem.children.push(new MenuItem(bucket.name, null, function() {
          $state.go('home.postStreamPage.bucket', params);
        }));
      });
    }

    var bucketsMenuItem = new MenuItem('Buckets', 'bitbucket', null, [newBucket]);
    $scope.userBuckets = Bucket.query({owner: currentUser._id});
    $scope.userBuckets.$promise.then(makeBucketMenuItems);

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