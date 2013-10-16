var app = require('express')();
app.directory = __dirname;

require('./config/environments')(app);
require('./routes')(app);

module.exports = app;
