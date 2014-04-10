var S3Controller = require('../controller/S3Controller');
var AuthenticationController = require('../controller/AuthenticationController');
var ImageController = require('../controller/ImageController');
var ErrorController = require('../controller/ErrorController');
var ProfilePhotoController = require('../controller/ProfilePhotoController');

var prefix = require('./prefixes');
var multiparty = require('multiparty');
var uuid = require('node-uuid');
var logger = require('winston');
var _ = require('lodash-node');

var User = require('../model/User').model;

var supportedImageUploadTypes = [ 'profile', 'post' ];
var supportedImageContentTypes = [ 'image/gif', 'image/jpeg', 'image/png', 'image/jpg' ];

module.exports = function(app) {
  app.post(prefix.upload + '/image', AuthenticationController.checkAuthenticated, function(req, res) {
    var MB = 1048576;
    var form = new multiparty.Form({
      maxFilesSize: 10 * MB
    });

    form.parse(req, function(err, fields, files) {
      if (err) return ErrorController.sendErrorJson(res, 500, err.message);
      if (_.isEmpty(fields.type)) {
        return ErrorController.sendErrorJson(res, 400, 'Must provide a type');
      }

      var type = fields.type[0];
      if (!_.contains(supportedImageUploadTypes, type)) {
        return ErrorController.sendErrorJson(res, 400, 'Unsupported image upload type: ' + type);
      }

      var file = files.file[0];
      var contentType = file.headers['content-type'];
      if (!_.contains(supportedImageContentTypes, contentType)) {
        return ErrorController.sendErrorJson(res, 400, 'Unsupported image type: ' + contentType);
      }

      ImageController.squarifyImage({
        filePath: file.path
      }, function(err, filePath) {
        if (err) return ErrorController.sendErrorJson(res, 500, err.message);

        User.deTokenize(req.user, function(err, user) {
          if (err) return ErrorController.sendErrorJson(res, 500, err.message);

          ProfilePhotoController.uploadProfilePhoto({
            user: user,
            filePath: filePath,
            contentType: contentType,
            fileSize: file.size
          }, function(err, result) {
            if (err) return ErrorController.sendErrorJson(res, 500, err.message);

            res.json(result);
          });
        });
      });
    });
  });
};