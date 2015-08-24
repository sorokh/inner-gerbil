/* Configuration for sri4node, used for our server.js, but also for mocha tests */

exports = module.exports = function (sri4node, verbose) {
  'use strict';

  var cacheconfig = {
    ttl: 60,
    type: 'local'
  };

  return {
    logrequests: true,
    logsql: verbose,
    logdebug: verbose,
    defaultdatabaseurl: 'postgres://gerbil:inner@localhost:5432/postgres',
    identity: function (/*username, database*/) {
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
    resources: [
      require('./contactdetails')(sri4node, cacheconfig),
      require('./parties')(sri4node, cacheconfig),
      require('./partyrelations')(sri4node, cacheconfig),
      require('./partycontactdetails')(sri4node, cacheconfig),
      require('./transactions')(sri4node, cacheconfig),
      require('./transactionrelations')(sri4node, cacheconfig),
      require('./messages')(sri4node, cacheconfig),
      require('./messagecontactdetails')(sri4node, cacheconfig),
      require('./messageparties')(sri4node, cacheconfig),
      require('./messagetransactions')(sri4node, cacheconfig),
      require('./messagerelations')(sri4node, cacheconfig),

      require('./plugins.js')(sri4node, cacheconfig),
      require('./pluginauthorisations.js')(sri4node, cacheconfig),
      require('./plugindata.js')(sri4node, cacheconfig),
      require('./pluginconfigurations.js')(sri4node, cacheconfig)
    ]
  };
};
