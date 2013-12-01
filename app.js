// modules
var express = require('express');

// local vars
var app = require('express')();

app.directory = __dirname;

var config = require('./config');
config.configAll(app);

var HelperRoutes = require('./local/HelperRoutes');
if (HelperRoutes) {
  HelperRoutes(app);
}

module.exports = app;
