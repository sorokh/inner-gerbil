/*eslint-env node, mocha */
var path = require('path');
var importer = require('../../elas-import/importer.js');
var importUser = require('../../elas-import/importUsers.js');
var importMessage = require('../../elas-import/importMessages.js');
var assert = require('assert');
var common = require('../common.js');
var sriclient = require('sri4node-client');
var doGet = sriclient.get;

var PATH_TO_USERS_FILE = 'elas-users-2015-10-14.csv';
var PATH_TO_MSGS_FILE = 'elas-messages-2015-10-26.csv';

exports = module.exports = function (base, logverbose) {
  'use strict';

  function debug(x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  describe('Elas import testing', function () {

    describe('CSV Importer', function () {
      it('should call function for each entry in CSV file', function () {
        var importMethod = function (entry) {
          debug('importing...');
          debug(entry); //here is json object to import
          //return Promise.reject('it fails');
          return Promise.resolve('it succeeds');
        };
        return importer(path.join(__dirname, PATH_TO_USERS_FILE), importMethod);

      });
    });
    describe('Import users', function () {
      it('should load users from CSV file', function () {
        var partyUrl = common.hrefs.PARTY_LETSDENDERMONDE;


        return importer(path.join(__dirname, PATH_TO_USERS_FILE), function (user) {
          return importUser(user, partyUrl);
        }).then(function () {
          // Get and validate imported user
          return doGet(base + '/parties?alias=100', 'annadv', 'test').then(function (response) {
            var parties = response.body;
            var party = parties.results[0].$$expanded;
            debug(party);
            assert.equal(party.alias, '100');
            assert.equal(party.type, 'person');
            assert.equal(party.name, 'Jules the admin');
            assert.equal(party.status, 'active');
          });

        });
      });
    });
    describe('Import messages', function () {
      it('should load messages from CSV file', function () {
        //return messagesImporter(path.join(__dirname, PATH_TO_MSGS_FILE), common.hrefs.PARTY_LETSDENDERMONDE)
        return importer(path.join(__dirname, PATH_TO_MSGS_FILE), function (message) {
          return importMessage(message, common.hrefs.PARTY_LETSDENDERMONDE);
        }).then(function () {
          // Get and validate imported message
          // TODO: filter get to return newly inserted message
          return doGet(base + '/messages', 'annadv', 'test').then(function (response) {
            var messages = response.body;
            debug(messages);
            var message = messages.results[0].$$expanded;
            debug(message);
            // TODO: match assertions with inserted messages
            //assert.equal(message.title, '100');
            //assert.equal(message.description, 'test message');
          });
        });
      });
    });
  });
};
