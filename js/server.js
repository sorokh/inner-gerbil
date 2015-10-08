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

var c9_hostname = process.env.C9_HOSTNAME; // eslint-disable-line

if(c9_hostname) {
  cl('https://' + c9_hostname);
}

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
  '</ul>' +
  '<p>Other resource :</p>' +
  '<ul>' +
  '<li>Messages can have contact details : <a href="/messagecontactdetails">/messagecontactdetails</a></li>' +
  '<li>Messages are posted to one or more parties : <a href="/messageparties">/messageparties</a></li>' +
  '<li>Messages have relationships (e.g. a response to another message) : ' +
  '<a href="/messagerelations">/messagerelations</a></li>' +
  '<li>Messages can have associated transactions : <a href="/messagetransactions">/messagetransactions</a></li>' +
  '<li>Parties have contactdetails : <a href="/partycontactdetails">/partycontactdetails</a></li>' +
  '<li>Parties have relationships with other parties (e.g. are member of) : ' +
  '<a href="/partyrelations">/partyrelations</a></li>' +
  '</ul>' +
  '<p>Plugins can be authorized, can store data about other resources, etc :</p>' +
  '<ul>' +
  '<li>Plugins : <a href="/plugins">/plugins</a></li>' +
  '<li>Plugins authorisations : <a href="/pluginauthorisations">/pluginauthorisations</a></li>' +
  '<li>Plugins data : <a href="/plugindata">/plugindata</a></li>' +
  '<li>Plugins are configured : <a href="/pluginconfigurations">/pluginconfigurations</a></li>' +
  '</ul>' +
  '';
app.get('/', function (request, response) {
  'use strict';
  response.send(welcome);
});

app.listen(app.get('port'), function () {
  'use strict';
  cl('Node app is running on port ' + app.get('port'));
});
