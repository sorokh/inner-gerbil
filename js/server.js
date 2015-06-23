var express = require('express');
var compress = require('compression');
var app = express();
var pg = require('pg');
var Q = require('q');
var sri4node = require('sri4node');
var $u = sri4node.utils;
var $m = sri4node.mapUtils;
var $s = sri4node.schemaUtils;
var $q = sri4node.queryUtils;

var contactdetails = require('./contactdetails.js');
var parties = require('./parties.js');
var partycontactdetails = require('./partycontactdetails.js');
var relations = require('./relations.js');
var transactions = require('./transactions.js');
var transactionrelations = require('./transactionrelations.js');
var messages = require('./messages.js');
var messagecontactdetails= require('./messagecontactdetails.js');
var messageparties = require('./messageparties.js');
var messagetransactions = require('./messagetransactions.js');

var logentries = require('node-logentries');
var log = logentries.logger({
  token:'ede8cbc7-38c8-4d49-8146-24de8777e2bd'
});

var local = true;
function debug(x) {
    if(!local) {
        log.info("test");
    } else {
        console.log(x);
    }
}

// Make sure all requests are sent with compression if the client supports it.
app.use(compress()); 

var verbose = false;
mapping = {
        // Log and time HTTP requests ?
        logrequests : true,
        // Log SQL ?
        logsql: verbose,
        // Log debugging information ?
        logdebug: verbose,
        // A function to determine the security function.
        identity : function(username, database) {
            debug('identity()');
            var query = $u.prepareSQL("me");
            query.sql('select * from persons where email = ').param(username);
            return $u.executeSQL(database, query).then(function (result) {
                var row = result.rows[0];
                var output = {};
                output.$$meta = {};
                output.$$meta.permalink = '/persons/' + row.guid;
                output.firstname = row.firstname;
                output.lastname = row.lastname;
                output.email = row.email;
                return output;
            });
        },
        resources : [
            contactdetails(sri4node),
            parties(sri4node),
            relations(sri4node),
            partycontactdetails(sri4node),
            transactions(sri4node),
            transactionrelations(sri4node),
            messages(sri4node),
            messagecontactdetails(sri4node),
            messageparties(sri4node),
            messagetransactions(sri4node)
        ]
    }

sri4node.configure(app, pg, mapping)
app.set('port', (process.env.PORT || 5000))

var welcome = "<p>Welcome to the <a href='https://github.com/dimitrydhondt/inner-gerbil'>Inner Gerbil API.</a></p>" +
    "<p>You can access the following resources :</p>" +
    "<ul>" +
    "<li>Parties : <a href='/parties'>/parties<a></li>" +
    "<li>Relations : <a href='/relations'>/relations<a></li>" +
    "<li>Contact details for parties : <a href='/contactdetails'>/contactdetails<a></li>" +
    "<li>Transactions : <a href='/transactions'>/transactions<a></li>" +
    "<li>Trace of transactions : <a href='/transactionrelations'>/transactionrelations<a></li>" +
    "</ul>";

    
app.get('/', function(request, response) {
  response.send(welcome);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
