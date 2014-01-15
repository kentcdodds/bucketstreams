angular.module('bsApp').controller('ComponentWrapperCtrl', function($scope) {
  $scope.post = {
    author: {
      username: 'testuser',
      name: {
        first: 'Kent C.',
        last: 'Dodds'
      },
      profilePicture: {
        url: 'http://lorempixel.com/50/50/technics/'
      }
    },
    content: [
      {
        textContent: 'Bacon ipsum dolor sit amet sausage salami t-bone, chicken meatball doner turducken pastrami cow turkey. Biltong pancetta pig salami pork chop tenderloin tail, jowl leberkas short ribs chicken turkey spare ribs corned beef beef.'
      }
    ],
    modified: new Date(),
    id: '1234'
  }
});