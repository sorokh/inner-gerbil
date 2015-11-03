/*eslint-env node, mocha */
var path = require('path');
var usersImporter = require('../../elas-import/importUsers.js');
var messagesImporter = require('../../elas-import/importMessages.js');
var PATH_TO_USERS_FILE = 'elas-users-2015-10-14.csv';
var PATH_TO_MSGS_FILE = 'elas-messages-2015-10-26.csv';

exports = module.exports = function () {
  'use strict';
  describe('Elas import testing', function () {

    describe('Import users', function () {
      it('should load users from CSV file', function () {
        return usersImporter(path.join(__dirname, PATH_TO_USERS_FILE));
      });
    });
    describe('Import messages', function () {
      it('should load messages from CSV file', function () {
        return messagesImporter(path.join(__dirname, PATH_TO_MSGS_FILE));
      });
    });
  });
};
