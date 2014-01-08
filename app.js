// modules
var express = require('express');

// local vars
var app = require('express')();

app.set('directory', __dirname);

var config = require('./config');
config.configAll(app);

module.exports = app;
