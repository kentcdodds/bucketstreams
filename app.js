// modules
var express = require('express');

// local vars
var app = require('express')();

app.directory = __dirname;

var config = require('./config');
config.configAll(app);

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
  require('./local/HelperRoutes')(app);
}

module.exports = app;
