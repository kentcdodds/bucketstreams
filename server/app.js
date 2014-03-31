var express = require('express');
var app = require('express')();

var config = require('./config')(app);

module.exports = app;
