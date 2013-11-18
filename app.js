
var localConfig = require('./local/config');
if (localConfig) {
  localConfig();
}

require('./config/database')();

var app = require('express')();
app.directory = __dirname;

require('./config/setup-express')(app);
require('./routes')(app);

console.log(app.routes);

module.exports = app;
