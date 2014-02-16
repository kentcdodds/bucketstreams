var ErrorController = require('../controller/ErrorController');
var logger = require('winston');

var http = require('http');
var util = require('util');
var multiparty = require('multiparty');
var knox = require('knox');
var Batch = require('batch');

var s3Client = knox.createClient({
  secure: false,
  key: process.env.S3_KEY,
  secret: process.env.S3_SECRET,
  bucket: process.env.S3_BUCKET
});

var Writable = require('readable-stream').Writable;
util.inherits(ByteCounter, Writable);
function ByteCounter(options) {
  Writable.call(this, options);
  this.bytes = 0;
}

ByteCounter.prototype._write = function(chunk, encoding, cb) {
  this.bytes += chunk.length;
  cb();
};

var supportedTypes = {
  profile: true,
  post: true
};

module.exports = function(app) {
  app.post('/upload/image', function(req, res) {
    var type = req.query.type;
    var username = req.query.user;
    if (!supportedTypes[type]) {
      return ErrorController.sendErrorJson(res, 401, 'Unsupported image upload type: ' + type);
    }

    var headers = {
      'x-amz-acl': 'public-read'
    };
    var form = new multiparty.Form();
    var batch = new Batch();
    batch.push(function(cb) {
      form.on('field', function(name, value) {
        if (name === 'path') {
          var destPath = value;
          if (destPath[0] !== '/') destPath = '/' + destPath;
          cb(null, destPath);
        }
      });
    });

    batch.push(function(cb) {
      form.on('part', function(part) {
        if (! part.filename) return;
        cb(null, part);
      });
    });

    batch.end(function(err, results) {
      if (err) throw err;
      form.removeListener('close', onEnd);
      var destPath = results[0];
      var part = results[1];

      var counter = new ByteCounter();
      part.pipe(counter); // need this until knox upgrades to streams2
      headers['Content-Length'] = part.byteCount;
      s3Client.putStream(part, destPath, headers, function(err, s3Response) {
        if (err) throw err;
        res.statusCode = s3Response.statusCode;
        s3Response.pipe(res);
        console.log('https://s3.amazonaws.com/' + process.env.S3_BUCKET + destPath);
      });
      part.on('end', function() {
        console.log('part end');
        console.log('size', counter.bytes);
      });
    });

    form.on('close', function(error) {
      logger.error(error);
      return ErrorController.sendErrorJson(res, 500, 'There was a problem uploading the file.');
    });
    form.parse(req);
  });
};