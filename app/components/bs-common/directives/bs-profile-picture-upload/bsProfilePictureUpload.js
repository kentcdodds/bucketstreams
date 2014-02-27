angular.module('bs.directives').directive('bsProfilePictureUpload', function(CurrentUserService, $timeout, $upload, AlertService) {
  return {
    restrict: 'E',
    templateUrl: '/components/bs-common/directives/bs-profile-picture-upload/bsProfilePictureUpload.html',
    scope: {},
    link: function(scope, el, attrs) {
      scope.currentUser = CurrentUserService.getUser();
      var width = el.parent()[0].offsetWidth;
      var newImageEl = angular.element(el.find('img')[1]);
      var newImageElWrapper = newImageEl.parent();
      newImageElWrapper.css('width', width + 'px');
      newImageElWrapper.css('margin-left', '-' + (width / 2) + 'px');

      scope.uploadInProgress = false;
      function fadeInNewPhoto() {
        var opacity = 0;
        newImageElWrapper.css('z-index', 0);
        function move() {
          if (scope.uploadInProgress) {
            if (scope.error) {
              newImageElWrapper.css('opacity', '0');
            } else {
              newImageElWrapper.css('opacity', '1');
            }
            return;
          }
          opacity++;
          if (opacity > scope.uploadProgress) {
            opacity = scope.uploadProgress;
          }
          console.log('parent Opacity:', (opacity / 100));
          newImageElWrapper.css('opacity', opacity / 100);
          scope.$apply();
          if (opacity < 100) {
            $timeout(function() {
              move();
            }, 10);
          }
        }
        move();
      }

      scope.onFileSelect = function(image) {
        scope.uploadInProgress = true;
        scope.uploadProgress = 0;
        scope.fileBeingUploaded = image;
        scope.error = null;

        // crop file
        if (angular.isArray(image)) {
          image = image[0];
        }
        cropPhoto(image, function(croppedImage) {
          fadeInNewPhoto();
          scope.upload = $upload.upload({
            url: '/upload/image',
            method: 'POST',
            data: {
              type: 'profile',
              name: scope.photoName,
              user: scope.currentUser.username
            },
            file: image
          }).progress(function(event) {
            scope.uploadProgress = Math.floor(event.loaded / event.total);
            console.log('progress', scope.uploadProgress);
            scope.$apply();
          }).success(function(data, status, headers, config) {
            scope.uploadInProgress = false;
            AlertService.success('Saved');
            CurrentUserService.refreshUser();
          }).error(function(err) {
            scope.uploadInProgress = false;
            scope.error = err;
            AlertService.error('Error uploading file: ' + err.message || err);
          });
        });

      };

      function cropPhoto(image, callback) {
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
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
            var data = canvas.toDataURL();
            newImageEl.src = data;
            var png = data.split(',')[1];
            var newFile = new Blob([window.atob(png)],  {type: 'image/png', encoding: 'utf-8'});
            var newFileReader = new FileReader();
            newFileReader.onload = function(event) {
              callback(newFile);
            };
            newFileReader.readAsDataURL(newFile);
          };

          image.src = event.target.result;
        };
        fileReader.readAsDataURL(image);
      }
    }
  }
});