var express = require('express');
var app = require('express')();

var config = require('./config');
config.configAll(app);

module.exports = app;
