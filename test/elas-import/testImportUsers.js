/*eslint-env node, mocha */

var usersImporter = require('../../elas-import/importUsers.js');
var PATH_TO_FILE = 'elas-users-2015-10-14.csv';

exports = module.exports = function () {
  'use strict';
  describe('Elas import testing', function () {

    describe('Import users', function () {
      it('should load users from CSV file', function () {
        return usersImporter(process.cwd() + '/' + PATH_TO_FILE);
      });
    });
  });
};
