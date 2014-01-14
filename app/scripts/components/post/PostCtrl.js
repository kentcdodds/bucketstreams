angular.module('bucketstreamsApp').controller('PostCtrl', function($scope) {
  $scope.post = {
    content: 'Hello world! I\'m some post content!',
    author: {
      name: 'Kent C. Dodds'
    }
  }
});