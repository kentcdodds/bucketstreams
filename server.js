var logger = require('winston');
if (process.argv.indexOf('prod') > -1) {
  process.env.NODE_ENV = 'production';
  process.env.LOCAL = true;
}

var app = require('./app');

require('http').createServer(app).listen(app.get('port'), app.get('ip'), function() {
  logger.info('On ' + process.env.NODE_ENV + ' express (' + app.get('env') + ') server listening here: ' + app.get('ip') + ':' + app.get('port'));
});
