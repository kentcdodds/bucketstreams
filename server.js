var logger = require('winston');
if (process.argv.indexOf('prod') > -1) {
  process.env.NODE_ENV = 'production';
  process.env.LOCAL = true;
}

if (process.env.OPENSHIFT_NODEJS_IP) {
  logger.info('On Openshift:', process.env.OPENSHIFT_NODEJS_IP + ':' + process.env.OPENSHIFT_NODEJS_PORT);
}

var app = require('./app');
logger.info('Getting ready to create server... On ' + process.env.NODE_ENV + ' express (' + app.get('env') + ') server will listen here: ' + app.get('ip') + ':' + app.get('port'));

require('http').createServer(app).listen(app.get('port'), app.get('ip'), function() {
  logger.info('On ' + process.env.NODE_ENV + ' express (' + app.get('env') + ') server listening here: ' + app.get('ip') + ':' + app.get('port'));
});
