  /*eslint-env node */
var express = require('express'),
  compress = require('compression'),
  pg = require('pg');

var sri4node = require('sri4node');

var verbose = false;
var mapping = require('./config.js')(sri4node, verbose);
var app = express();
app.use(compress());
app.set('port', process.env.PORT || 5000); // eslint-disable-line
sri4node.configure(app, pg, mapping);

var welcome =
  '<p>Welcome to the <a href="https://github.com/dimitrydhondt/inner-gerbil">Inner Gerbil API.</a></p>' +
  '<p>You can access the following resources :</p>' +
  '<ul><li>Current user identity : <a href="/me">/me</a> (e.g. username: annadv, password: test)</li></ul>' +
  '<ul>' +
  '<li>Parties : <a href="/parties">/parties</a></li>' +
  '<li>Messages : <a href="/messages">/messages</a></li>' +
  '<li>Transactions : <a href="/transactions">/transactions<a></li>' +
  '</ul><ul>' +
  '<li>Contact details for parties : <a href="/contactdetails">/contactdetails<a></li>' +
  '<li>Trace of transactions : <a href="/transactionrelations">/transactionrelations<a></li>' +
  '</ul><ul>' +
  '<li>Plugins : <a href="/plugins">/plugins</a></li>' +
  '<li>Plugins authorisations : <a href="/pluginauthorisations">/pluginauthorisations</a></li>' +
  '<li>Plugins data : <a href="/plugindata">/plugindata</a></li>' +
  '</ul>';
app.get('/', function (request, response) {
  'use strict';
  response.send(welcome);
});

app.listen(app.get('port'), function () {
  'use strict';
  console.log('Node app is running on port', app.get('port'));
});
