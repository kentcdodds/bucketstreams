angular.module('bs.directives').directive('bsProfilePicture', function() {
  return {
    restrict: 'E',
    template: '<div class="bs-profile-picture-wrapper"><img ng-src="{{user.getProfilePicture()}}" class="img-circle"></div>',
    replace: true,
    scope: {
      user: '=user',
      size: '@?',
      hideHover: '@?'
    },
    link: function(scope, element, attrs) {
      var img = element.find('img');
      if (~~scope.size) {
        img[0].width = scope.size;
        img[0].height = scope.size;
      } else {
        img.addClass(scope.size || 'medium');
      }
    }
  };
});