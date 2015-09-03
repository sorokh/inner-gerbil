/*eslint-env node, mocha */

var express = require('express');
//var compress = require('compression');
var pg = require('pg');

var sri4node = require('sri4node');
var common = require('./common.js');
var cl = common.cl;

var verbose = true;

var app = express();
var mapping = require('../js/config.js')(sri4node, verbose);
var port = 5000;
app.set('port', port);
sri4node.configure(app, pg, mapping);
var base = 'http://localhost:' + port;


app.listen(port, function () {
  'use strict';
  cl('Node app is running at localhost:' + port);
});

require('./testTransactions.js')(base, verbose);
require('./testContactdetails.js')(base, verbose);
require('./testParties.js')(base, verbose);
require('./testMessages.js')(base, verbose);
require('./testPlugins.js')(base, verbose);
