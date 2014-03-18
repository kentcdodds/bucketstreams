var logger = require('winston');

logger.info('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
logger.info('Hello World! Starting up BucketStreams!');

if (process.argv.indexOf('prod') > -1) {
  logger.info('pretending to be production');
  process.env.NODE_ENV = 'production';
  process.env.LOCAL = true;
}

if (process.env.OPENSHIFT_NODEJS_IP) {
  logger.info('On Openshift:', process.env.OPENSHIFT_NODEJS_IP + ':' + process.env.OPENSHIFT_NODEJS_PORT);
}

var app = require('./server/app');
logger.info('Getting ready to create server... On ' + process.env.NODE_ENV + ' express (' + app.get('env') + ') server will listen here: ' + app.get('ip') + ':' + app.get('port'));

var server = require('http').createServer(app);
server.listen(app.get('port'), app.get('ip'), function() {
  logger.info('On ' + process.env.NODE_ENV + ' express (' + app.get('env') + ') server listening here: ' + app.get('ip') + ':' + app.get('port'));
});

process.on('SIGINT', function() {
  logger.info('\nGracefully shutting down from SIGINT (Ctrl-C)');
  process.exit();
});

process.on('exit', function () {
  process.BUCKET_STREAMS_EXITING = true;
  logger.info('About to exit, waiting for remaining connections to complete');
  require('mongoose').disconnect(function() {
    logger.info('Mongo disconnected. Closing server. Goodbye! :)');
    server.close();
  });
});
