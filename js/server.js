/*eslint-env node */
var express = require('express'),
  compress = require('compression'),
  pg = require('pg');

var sri4node = require('sri4node');
var common = require('./common.js');
var cl = common.cl;
var verbose = false;
var mapping = require('./config.js')(sri4node, verbose);
var app = express();

var c9hostname = process.env.C9_HOSTNAME; // eslint-disable-line

if (c9hostname) {
  cl('https://' + c9hostname);
}

app.use(compress());
app.set('port', process.env.PORT || 5000); // eslint-disable-line
sri4node.configure(app, pg, mapping);

var welcome =
  '<script>location.replace("/docs");</script>';

app.get('/', function (request, response) {
  'use strict';
  response.send(welcome);
});

app.listen(app.get('port'), function () {
  'use strict';
  cl('Node app is running on port ' + app.get('port'));
});
