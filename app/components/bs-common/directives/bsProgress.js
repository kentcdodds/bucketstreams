angular.module('bs.directives').directive('bsProgress', function($timeout) {
  return {
    restrict: 'A',
    template: '<img src="" class="img-circle">',
    scope: {
      bsProgress: '=',
      image: '='
    },
    link: function(scope, el, attrs) {
      var width = el.parent()[0].offsetWidth;
      var imageEl = el.find('img');
      el.addClass('bs-progress');
      el.css('height', '100%');
      el.css('width', width + 'px');
      el.css('margin-left', '-' + (width / 2) + 'px');
      var moveInProgress = false;
      function makeChange() {
        var opacity = 0;
        moveInProgress = true;
        el.css('z-index', 0);
        function move() {
          opacity++;
          console.log('el Opacity:', (opacity / 100));
          el.css('opacity', opacity / 100);
          scope.$apply();
          if (opacity < 100) {
            $timeout(function() {
              move();
            }, 10);
          } else {
            moveInProgress = false;
          }
        }
        move();
      }
      scope.$watch('bsProgress', function(progress) {
        if (moveInProgress) {
          return;
        }
        //noinspection FallThroughInSwitchStatementJS
        switch (progress) {
          case -1:
            break;
          case 0:
            makeChange();
            break;
          case 1:
            el.css('opacity', '0');
          default:
            var left = progress * width;
            break;
        }
      });
      scope.$watch('image', function(image) {
        if (!image) return;
        if (angular.isArray(image)) {
          image = image[0];
        }
        var FR = new FileReader();
        FR.onload = function(event) {
          var image = new Image();
          var canvasSize = 512;
          image.onload = function() {
            var height = image.height;
            var width = image.width;
            var top = 0;
            var left = 0;
            var square = 0;
            if (height >= width) {
              square = width;
              top = Math.floor((height - width) / 2);
            } else {
              square = height;
              left = Math.floor((width - height) / 2);
            }
            var canvas = document.createElement('canvas');
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, left, top, square, square, 0, 0, canvasSize, canvasSize);
            imageEl.attr('src', canvas.toDataURL());
          };

          image.src = event.target.result;
        };
        FR.readAsDataURL(image);
      });
    }
  }
});