var easyimg = require('easyimage');
var os = require('os');
var uuid = require('node-uuid');

function makeImageSquare(filePath, callback) {
  return callback(null, filePath);
  // TODO: Make this work...

  var destPath = os.tmpdir() + uuid.v4() + filePath.substring(filePath.lastIndexOf('/'));

  getImageInfo(filePath, function(err, stdout) {
    if (err) return callback({ message: err });
    console.log(stdout);

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

    easyimg.rescrop({
      src: filePath, dst: destPath,
      width: 500, height: 500,
      cropwidth: 128, cropheight: 128,
      x: 0, y: 0
    }, function(err) {
      callback(err, destPath);
    });

  });
}


function getImageInfo(filePath, callback) {
  if (filePath.lastIndexOf('.png') + 4 === filePath.length) {
    var destPath = os.tmpdir() + uuid.v4() + filePath.substring(filePath.lastIndexOf('/'));
    easyimg.exec('convert ' + filePath + ' -strip ' + destPath, function(err) {
      if (err) return callback(err);

      easyimg.info(destPath, callback);
    });
  } else {
    easyimg.info(filePath, callback);
  }
}

module.exports = {
  squarifyImage: function(options, callback) {
    makeImageSquare(options.filePath, callback);
  }
};