angular.module('bs.componentWrapper').controller('ComponentWrapperCtrl', function($scope, $timeout, CurrentUserService, Stream, Bucket, Comment, Post, User) {

  $scope.show = {
    spinners: true,
    streams: false,
    posts: false
  };

  /*
   * Spinner
   */
  $scope.spinners = {
    blink: {
      visible: true
    }
  };

  function getRandomProfilePhoto(height, width) {
    return 'http://lorempixel.com/' + (height || 64) + '/' + (width || 64) + '/technics/?random=' + Math.floor(Math.random() * 1000);
  }

  $scope.user = {
    username: 'kentcdodds',
    name: {
      first: 'Kent C.',
      last: 'Dodds'
    },
    profilePicture: {
      url: getRandomProfilePhoto()
    }
  };

  $scope.newPost = {
    author: $scope.user,
    content: [
      {
        textContent: ''
      }
    ]
  };

  $scope.post = {
    author: {
      username: 'testuser',
      name: {
        first: 'Sean',
        last: 'Southerland'
      },
      profilePicture: {
        url: getRandomProfilePhoto()
      }
    },
    content: [
      {
        textContent: 'Bacon ipsum dolor sit amet sausage salami t-bone, chicken meatball doner turducken pastrami cow turkey. Biltong pancetta pig salami pork chop tenderloin tail, jowl leberkas short ribs chicken turkey spare ribs corned beef beef.'
      }
    ],
    modified: new Date(),
    id: '1234',
    comments: [
      {
        author: {
          username: 'brookedodds',
          name: {
            first: 'Brooke',
            last: 'Dodds'
          },
          profilePicture: {
            url: getRandomProfilePhoto()
          }
        },
        modified: new Date(),
        content: 'This is an amazing post!'
      },
      {
        author: {
          username: 'mackcope',
          name: {
            first: 'Mack',
            last: 'Cope'
          },
          profilePicture: {
            url: getRandomProfilePhoto()
          }
        },
        modified: new Date(),
        content: 'Bacon ipsum dolor sit amet sausage salami t-bone, chicken meatball doner turducken pastrami cow turkey. Biltong pancetta pig salami pork chop tenderloin tail, jowl leberkas short ribs chicken turkey spare ribs corned beef beef.'
      }
    ],
    buckets: [
      {
        id: 'bucket-1',
        name: 'Hello world'
      },
      {
        id: 'bucket-2',
        name: 'Bucket 2'
      },
      {
        id: 'bucket-3',
        name: 'Long bucket name'
      },
      {
        id: 'bucket-4',
        name: 'Bucket Streams Rocks'
      }
    ]
  };

  $scope.stream = {
    owner: $scope.user,
    name: 'Way Cool Stuff',
    visibility: [],
    subscriptions: {
      buckets: [],
      streams: []
    }
  };

  $scope.currentUser = CurrentUserService.getUser();
  $scope.$on(CurrentUserService.userUpdateEvent, function(updatedUser) {
    $scope.currentUser = updatedUser;
  });

  function setupStream() {
    Stream.get({id: '52fc4bc876166acc37000009'}).then(function(stream) {
      if (stream) {
        $scope.stream = stream;
      } else {
        $scope.stream = new Stream({
          owner: '52ddf43125cb9d9b71000009',
          name: 'Way Cool Stuff'
        });
        stream.$save();
      }
    });
  }


  $scope.createNewStream = function() {
    var newStream = new Stream({
      owner: '52ddf43125cb9d9b71000009',
      name: 'Way Cool Stuff'
    });
    newStream.$save(function(theSavedStream) {
      console.log('Success stream - ', theSavedStream);
      Stream.get({id : theSavedStream._id}, function(theGottenStream) {
        theGottenStream.name = 'Way Cooler Stuff';
        theGottenStream.$save(function(secondSavedStream) {
          console.log('Success stream (again) - ', secondSavedStream);
        });
      });
    });
  };
});