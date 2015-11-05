var PATH_TO_FILE = 'elas-users-2015-10-14.csv';
var elasImporter = require('./importUsers.js');
elasImporter(process.cwd() + '/' + PATH_TO_FILE);
