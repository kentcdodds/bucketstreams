var http = require('http');
var util = require('util');
var multiparty = require('multiparty');
var knox = require('knox');
var logger = require('winston');
var uuid = require('node-uuid');
var _ = require('lodash-node');

var ErrorController = require('../controller/ErrorController');

var photoClient = knox.createClient({
  secure: false,
  key: process.env.S3_KEY,
  secret: process.env.S3_SECRET,
  bucket: process.env.S3_BUCKET_IMAGES
});
var imageUrlPrefix = 'https://s3.amazonaws.com/' + process.env.S3_BUCKET_IMAGES;

var supportedImageUploadTypes = [ 'profile', 'post' ];

var supportedImageContentTypes = [ 'image/gif', 'image/jpeg', 'image/png', 'image/jpg' ];

module.exports = {
  uploadPhoto: function uploadPhoto(req, res) {
    var userId = req.user._id;
    logger.info('Preparing to receive uploaded photo');

    var form = new multiparty.Form();
    var fields = {};
    var parts = {};
    var partsArry = [];

    form.on('field', function(name, value) {
      fields[name] = value;
    });

    form.on('part', function(part) {
      if (!part.filename) return;
      parts[part.filename] = part;
      partsArry.push(part);
    });

    form.on('error', function(err) {
      logger.error('Error parsing form: ', err.message);
      return ErrorController.sendErrorJson(res, 500, err.message);
    });

    form.on('close', function() {
      var type = fields.type;
      if (!_.contains(supportedImageUploadTypes, type)) {
        return ErrorController.sendErrorJson(res, 400, 'Unsupported image upload type: ' + type);
      }

      var part = partsArry[0];
      var contentType = part.headers['content-type'];
      if (!_.contains(supportedImageContentTypes, contentType)) {
        return ErrorController.sendErrorJson(res, 400, 'Unsupported image type: ' + contentType);
      }

      var destPath = '/' + userId + '/' + type + '/' + uuid.v4() + '-' + part.filename.replace(' ', '-');

      var headers = {
        'x-amz-acl': 'public-read',
        'Content-Length': part.byteCount,
        'Content-Type': contentType
      };
      logger.info('Uploading profile photo');
      photoClient.putStream(part, destPath, headers, function(err, s3Response) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);
        logger.info('photo uploaded, setting as profile picture');
        var imageUrl = imageUrlPrefix + destPath;
        req.user.addProfilePicture(imageUrl, function(err, user) {
          if (err) return ErrorController.sendErrorJson(res, 500, err.message);
          res.statusCode = s3Response.statusCode;
          return res.json({
            imageUrl: imageUrl
          });
        });
      });
    });

    form.parse(req);
  }
};