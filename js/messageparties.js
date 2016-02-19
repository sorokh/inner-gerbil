var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var cl = common.cl;


exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;
    
    /**
  * Check if the referred message is under the specified users ownership.
  * This is direct ownership or ownership via group admin rights.
  **/
  function isOwnMessage(partyId, messagepartyId, database) {
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnMessageForMessageParty');
    q.sql('select * from messages m, messageparties mp where mp.key = ').param(messagepartyId);
    q.sql('and mp.message = m.key');
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
  
  function checkCreateAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    //You are allowed to create a message party relation if you own the message or if you are a superadmin?
    isOwnMessage(loggedInUser.key, resource.key, database).then(function (isOwn) {
      if (isOwn) {
        deferred.resolve(true);
      } else {
        deferred.reject('Sharing of message is not allowed!');
      }
    });
    return deferred.promise;
  }
  
  function checkUpdateAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    //You are allowed to update a message party relation if you own the message or if you are a superadmin?
    isOwnMessage(loggedInUser.key, resource.key, database).then(function (isOwn) {
      if (isOwn) {
        deferred.resolve(true);
      } else {
        deferred.reject('Update is not allowed!');
      }
    });
    return deferred.promise;
  }
    
  function checkDeleteAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    //You are allowed to delete a message party relation if you own the message or if you are a superadmin?
    // First you need to fetch the contactdetails for me.
    isOwnMessage(loggedInUser.key, resource.key, database).then(function (isOwn) {
      if (isOwn) {
        deferred.resolve(true);
      } else {
        deferred.reject('Delete is not allowed!');
      }
    });
    return deferred.promise;
  }

  function checkAccessOnResource(request, response, database, me, batch) {
    return security.checkAccessOnResource($u, request, response, database, me, batch,
      {
        read: checkReadAccessOnResource,
        create: checkCreateAccessOnResource,
        update: checkUpdateAccessOnResource,
        delete: checkDeleteAccessOnResource,
        table: 'messageparties'
      });
  }

  var ret = {
    type: '/messageparties',
    public: false,
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'Messages can be posted to one or more people/groups/subgroups/connector groups.' +
        'This resource expresses the relationship between a messages and a target party where that message is posted.',
      type: 'object',
      properties: {
        message: $s.permalink('/messages',
          'The message that was posted.'),
        party: $s.permalink('/parties',
          'The party where a message was posted.')
      },
      required: ['message', 'party']
    },
    map: {
      key: {},
      message: {
        references: '/messages'
      },
      party: {
        references: '/parties'
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
