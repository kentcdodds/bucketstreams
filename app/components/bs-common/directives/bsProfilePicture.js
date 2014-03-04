angular.module('bs.directives').directive('bsProfilePicture', function() {
  return {
    restrict: 'E',
    template: '<div class="bs-profile-picture-wrapper">' +
      '<a bindonce="user" bo-href="\'/\' + user.username">' +
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
      element.css('display', 'inline');
      var img = element.find('img');
      function setSize(size) {
        img.css('width', size);
        img.css('height', size);
      }
      if (~~scope.size) {
        setSize(scope.size + 'px');
      } else {
        switch (scope.size) {
          case 'small':
            setSize('32px');
            break;
          case 'large':
            setSize('128px');
            break;
          default:
            setSize('64px');
            break;
        }
      }
    }
  };
});