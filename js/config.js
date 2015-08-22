/* Configuration for sri4node, used for our server.js, but also for mocha tests */

exports = module.exports = function (sri4node, verbose) {
  'use strict';
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
      require('./contactdetails')(sri4node),
      require('./parties')(sri4node),
      require('./partyrelations')(sri4node),
      require('./partycontactdetails')(sri4node),
      require('./transactions')(sri4node),
      require('./transactionrelations')(sri4node),
      require('./messages')(sri4node),
      require('./messagecontactdetails')(sri4node),
      require('./messageparties')(sri4node),
      require('./messagetransactions')(sri4node),
      require('./messagerelations')(sri4node),

      require('./plugins.js')(sri4node),
      require('./pluginauthorisations.js')(sri4node),
      require('./plugindata.js')(sri4node),
      require('./pluginconfigurations.js')(sri4node)
    ]
  };
};
