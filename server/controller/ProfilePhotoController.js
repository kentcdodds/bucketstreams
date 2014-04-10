var fs = require('fs');
var util = require('util');

var DownloadController = require('./DownloadController');
var S3Controller = require('./S3Controller');
var uuid = require('node-uuid');
var logger = require('winston');

module.exports = {
  uploadProfilePhoto: function(options, callback) {
    var user = options.user;
    var url = options.url;
    var filePath = options.filePath;
    var contentType = options.contentType;
    var fileSize = options.fileSize;

    function uploadPhoto(filePath) {
      var extension = filePath.substring(filePath.lastIndexOf('.'));
      var destPath = '/' + user.id + '/profile' + '/' + uuid.v4() + extension;

      var headers = {
        'x-amz-acl': 'public-read',
        'Content-Length': fileSize,
        'Content-Type': contentType || 'image/' + extension.substring(1)
      };
      S3Controller.uploadPhoto({
        filePath: filePath,
        destPath: destPath,
        headers: headers
      }, function(err, imageUrl) {
        if (err) return callback(err);
        logger.info('photo uploaded, setting as profile picture', imageUrl);
        user.addProfilePicture(imageUrl, function(err, user) {
          if (err) return callback(err);

          callback(null, {
            imageUrl: imageUrl
          });
        });
      });
    }

    if (url) {
      DownloadController.download(url, function(err, filePath) {
        if (err) return callback(err);
        fs.stat(filePath, function(err, stats) {
          if (err) return callback(err);
          fileSize = stats.size;
          uploadPhoto(filePath);
        });
      });
    } else {
      uploadPhoto(filePath);
    }
  }
};