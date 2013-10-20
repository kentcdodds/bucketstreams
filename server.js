console.log('before app');
var app = require('./app');
console.log('after app');

require('http').createServer(app).listen(app.get('port'), app.get('ip'), function () {
  console.log('in create server');
  console.log('Express (' + app.get('env') + ') server listening on port ' + app.get('port'));
});
