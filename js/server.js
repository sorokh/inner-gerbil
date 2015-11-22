/*eslint-env node */
var express = require('express'),
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

var typeToConfig = function (config) {
  'use strict';
  var i;
  var ret = {};
  for (i = 0; i < config.length; i++) {
    ret[config[i].type] = config[i];
  }
  return ret;
};

function allowCrossDomain(req, res, next) {
  'use strict';
  var allowedMethods = 'GET,PUT,POST,DELETE,HEAD,OPTIONS';

  var origin = '*';
  if (req.headers.origin) {
    origin = req.headers.origin;
  } else if (req.headers.Origin) {
    origin = req.headers.Origin;
  }
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', allowedMethods);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.header('Allow', allowedMethods);
    res.status(200).send(allowedMethods);
  } else {
    next();
  }
};

app.use(allowCrossDomain);
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
