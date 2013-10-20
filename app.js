var app = require('express')();
app.directory = __dirname;

require('./config/express')(app);
//require('./config/database')();
require('./routes')(app);

module.exports = app;
