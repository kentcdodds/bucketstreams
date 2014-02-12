angular.module('bs.componentWrapper').controller('ComponentWrapperCtrl', function($scope) {

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
  }
});