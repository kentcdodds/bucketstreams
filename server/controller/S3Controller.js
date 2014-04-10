var s3 = require('s3');
var logger = require('winston');

var photoClient = s3.createClient({
  secure: false,
  key: process.env.S3_KEY,
  secret: process.env.S3_SECRET,
  bucket: process.env.S3_BUCKET_IMAGES
});

module.exports = {
  uploadPhoto: function uploadPhoto(options, callback) {
    logger.info('Uploading profile photo');
    var uploader = photoClient.upload(options.filePath, options.destPath, options.headers);

    uploader.on('error', function(err) {
      callback(err);
    });

    uploader.on('end', function(url) {
      callback(null, url);
    });
  }
};