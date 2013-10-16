var app = require('./app');

require('http').createServer(app).listen(app.get('port'), app.get('ip'), function () {
  console.log('Express (' + app.get('env') + ') server listening on port ' + app.get('port'));
});
