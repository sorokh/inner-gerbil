var express = require('express');
var compress = require('compression');
var pg = require('pg');
var Q = require('q');

var sri4node = require('sri4node');
var $u = sri4node.utils;
var $m = sri4node.mapUtils;
var $s = sri4node.schemaUtils;
var $q = sri4node.queryUtils;

function debug(x) {
    console.log(x);
}

var verbose = true;
mapping = {
        logrequests : true,
        logsql: verbose,
        logdebug: verbose,
        identity : function(username, database) {
            // To Do : implement security context.
            /*
                var query = $u.prepareSQL("me")
                query.sql('select * from persons where email = ').param(username)
                return $u.executeSQL(database, query).then(function (result) {
                    var row = result.rows[0];
                    ...
            */
            return {};
        },
        resources : [
            require('./contactdetails')(sri4node),
            require('./parties')(sri4node),
            require('./relations')(sri4node),
            require('./partycontactdetails')(sri4node),
            require('./transactions')(sri4node),
            require('./transactionrelations')(sri4node),
            require('./messages')(sri4node),
            require('./messagecontactdetails')(sri4node),
            require('./messageparties')(sri4node),
            require('./messagetransactions')(sri4node)
        ]
    }

var app = express()
app.use(compress())
app.set('port', (process.env.PORT || 5000))
sri4node.configure(app, pg, mapping)

var welcome = "<p>Welcome to the <a href='https://github.com/dimitrydhondt/inner-gerbil'>Inner Gerbil API.</a></p>" +
    "<p>You can access the following resources :</p>" +
    "<ul>" +
    "<li>Parties : <a href='/parties'>/parties<a></li>" +
    "<li>Relations : <a href='/relations'>/relations<a></li>" +
    "<li>Contact details for parties : <a href='/contactdetails'>/contactdetails<a></li>" +
    "<li>Transactions : <a href='/transactions'>/transactions<a></li>" +
    "<li>Trace of transactions : <a href='/transactionrelations'>/transactionrelations<a></li>" +
    "<li>Messages : <a href='/messages'>/messages</a></li>" +
    "</ul>";
app.get('/', function(request, response) {
  response.send(welcome);
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})
