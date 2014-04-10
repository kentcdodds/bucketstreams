var os = require('os');
var fs = require('fs');
var request = require('request');
var uuid = require('node-uuid');

module.exports = {
  download: function(src, dest, callback) {
    if (!callback) {
      callback = dest;
      dest = os.tmpdir() + uuid.v4() + '-' + src.substring(src.lastIndexOf('/') + 1);
    }

    var reader = request(src);
    reader.pipe(fs.createWriteStream(dest));
    reader.on('error', function(err) {
      callback(err);
    });
    reader.on('end', function() {
      callback(null, dest);
    });
  }
};