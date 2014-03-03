angular.module('bs.directives').directive('bsProfilePicture', function() {
  return {
    restrict: 'E',
    template: '<div class="bs-profile-picture-wrapper" bindonce="user">' +
      '<a bo-href="\'/\' + user.username">' +
        '<img bo-src="user.getProfilePicture()" class="img-circle">' +
      '</a>' +
    '</div>',
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