var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $s = sri4node.schemaUtils,
    $u = sri4node.utils,
    $q = sri4node.queryUtils;
    
    /**
  * Check if the referred message is under the specified users ownership.
  * This is direct ownership or ownership via group admin rights.
  **/
  function isOwnMessage(database, me, resource) {
    var messageId = resource.key;
    var partyId = me.key;
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnMessage');
    q.sql('select * from messages m where m.key = ').param(messageId);
    q.sql(' and m.author=').param(partyId);

    cl(q);
    $u.executeSQL(database, q).then(function (result) {
      cl(result.rows);
      if (result.rows.length > 0) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    }).catch(function (e) {
      cl(e);
      deferred.resolve(false);
    });
    return deferred.promise;
  }
  
  /**
   * Allow a user to link a transaction to a message if the message owner is participating in the transaction?
   *
   */

  function checkAccessOnResource(request, response, database, me, batch) {
    return security.checkAccessOnResource($u, request, response, database, me, batch,
      {
       // isOwn: isOwnTransaction,
        table: 'messages'
      });
  }

  var ret = {
    type: '/messagetransactions',
    public: false,
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'Expresses that a certain message has a certain transaction associated with it. ' +
      'One message can have multiple /messagetransactions, and as such have many transactions ' +
      'associated with it.',
      type: 'object',
      properties: {
        message: $s.permalink('/messages', 'The message.'),
        transaction: $s.permalink('/transactions', 'The related transaction.')
      },
      required: ['message', 'transaction']
    },
    map: {
      key: {},
      message: {
        references: '/messages'
      },
      transaction: {
        references: '/transactions'
      }
    },
    validate: [],
    query: {
      defaultFilter: $q.defaultFilter
    },
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
