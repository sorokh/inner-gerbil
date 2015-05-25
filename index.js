var express = require('express');
var app = express();
var pg = require('pg');
var sri4node = require('sri4node');
var $u = sri4node.utils;
var $m = sri4node.mapUtils;
var $s = sri4node.schemaUtils;

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

var databaseUrl = process.env.DATABASE_URL;
debug(databaseUrl);

var mapping = {
    // Log and time HTTP requests ?
    logrequests : true,
    // Log SQL ?
    logsql: false,
    // Log debugging information ?
    logdebug: false,
    // The URL of the postgres database
    defaultdatabaseurl : databaseUrl,
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
        {
            // Base url, maps 1:1 with a table in postgres 
            // Same name, except the '/' is removed
            type: "/parties",
            // Is this resource public ? 
            // Can it be read / updated / inserted publicly ?
            public: true,
            // Multiple function that check access control 
            // They receive a database object and
            // the security context of the current user.
            secure : [
                //checkAccessOnResource,
                //checkSomeMoreRules
            ],
            // Standard JSON Schema definition. 
            // It uses utility functions, for compactness.
            schema: {
                $schema: "http://json-schema.org/schema#",
                title: "A person, organisations, subgroup, group, connectorgroup, etc... participating in a mutual credit system.",
                type: "object",
                properties : {
                    type: {
                        type: "string",
                        description: "The type of party this resource describes.",
                        enum: ["person","organisation","group","connector"]
                    },
                    name: $s.string(1,256,"The name of the party. If it is a person with a christian name you should store [firstname initials/middlename lastname]. As there is no real universal format for naming people, we do not impose one here. (Like making 2 fields, firstname and lastname would do)"),
                    alias: $s.string(1,64,"Handle the party wants to be known by."),
                    dateofbirth: $s.timestamp("Date of birth for people. Other types of parties don't have a date of birth."),
                    imageurl: $s.string(1,2048,"URL to a profile image for people, a logo for groups, etc..."),
                    login: $s.string(3,64,"Login for accessing the API. Only people have a login."),
                    password: $s.string(3,64,"Password for accessing the API. Only people have a password. A group is managed by a person that has a relation of type 'administrator' with that group."),
                    secondsperunit: $s.numeric("If the party is a group, and it is using the mutual credit system as a time-bank (i.e. agreements with the members exist about using time as currency), then this value expresses the number units per second."),
                    currencyname: $s.string(1,64,"The name of the currency, as used by a group"),
                    status: {
                        type: "string",
                        description: "The status of this party. Is it active / inactive",
                        enum: ["active","inactive"]
                    }
                },
                required: ["type","name","status"]
            },
            // Functions that validate the incoming resource
            // when a PUT operation is executed.
            validate: [
                //validateAuthorVersusThemes
            ],
            // Supported URL parameters are configured
            // this allows filtering on the list resource.
            query: {
                //authors: contains('authors'),
                //themes: contains('themes'),
                //html: contains('html')
            },
            // All columns in the table that appear in the
            // resource should be declared.
            // Optionally mapping functions can be given.
            map: {
                type: {},
                name: {},
                alias: { onread: $m.removeifnull },
                dateofbirth: { onread: $m.removeifnull },
                imageurl: { onread: $m.removeifnull },
                login: { onread: $m.removeifnull },
                password: { onread: $m.remove },
                secondsperunit: { onread: $m.removeifnull },
                currencyname: { onread: $m.removeifnull },
                status: {}
            },
            // After update, insert or delete
            // you can perform extra actions.
            afterupdate: [],
            afterinsert: [],
            afterdelete: [ 
                //cleanupFunction 
            ]
        },
        {
            type: "/relations",
            public: true,
            secure : [],
            schema: {
                $schema: "http://json-schema.org/schema#",
                title: "A relationship between two parties that are using a mutual credit system. The type of relationship, together with the types of parties involved determines the semantics of the relationship. For example : when a person is a member of a group, this has a different meaning from a group being member of a connector. Connector groups are used to allow 2 communities of mutual credit users to exchange currency.",
                type: "object",
                properties : {
                    from: { references: "/parties" },
                    to: { references: "/parties" },
                    type: {
                        type: "string",
                        description: "The type of relationship. Currently 'member' and 'adminsitrator' are in use.",
                        enum: ["member","administrator"]
                    },
                    balance: $s.numeric("The balance (currency) of party A in his relationship with party B. Positive means party 'from' has credit, negative means party 'from' has depth."),
                    status: {
                        type: "string",
                        description: "The status of this relation. Is it active / inactive ?",
                        enum: ["active","inactive"]
                    }
                },
                required: ["from","to","type","balance","status"]
            },
            validate: [],
            query: {},
            map: {
                from: {references: '/parties'},
                to: {references: '/parties'},
                type: {},
                balance: {},
                status: {}
            },
            afterupdate: [],
            afterinsert: [],
            afterdelete: []
        }
    ]
};

sri4node.configure(app, pg, mapping);
app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('Welcome to the Inner Gerbil API.');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
