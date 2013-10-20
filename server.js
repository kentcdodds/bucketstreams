if (process.argv.indexOf('prod')) {
  process.env.NODE_ENV = 'production';
  process.env.LOCAL = true;
}

var app = require('./app');

require('http').createServer(app).listen(app.get('port'), app.get('ip'), function() {
  console.log('Express (' + app.get('env') + ') server listening here: ' + app.get('ip') + ':' + app.get('port'));
});
