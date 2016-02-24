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
  function isOwnContactDetail(partyId, messagecontactdetailId, database) {
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnContactDetailForMessageContactDetail');
    q.sql('select c.key from parties p, partycontactdetails pc, ');
    q.sql('contactdetails c, messagecontactdetails mc, messages m where ');
    q.sql('mc.key = ').param(messagecontactdetailId);
    q.sql('and mc.message = m.key');
    q.sql('and mc.contactdetail = c.key');
    q.sql('and pc.party = p.key');
    q.sql('and p.key=').param(partyId);
    q.sql('and m.author=').param(partyId);
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
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    //You are allowed to create a message contactdetail relation if you own the message
    //and the contadetail or if you are a superadmin?
    isOwnContactDetail(loggedInUser.key, resource.key, database).then(function (isOwn) {
      if (isOwn) {
        deferred.resolve(true);
      } else {
        deferred.reject('Sharing of contactdetail is not allowed!');
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
    isOwnContactDetail(loggedInUser.key, resource.key, database).then(function (isOwn) {
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
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    //You are allowed to delete a message party relation if you own the message or if you are a superadmin?
    // First you need to fetch the contactdetails for me.
    isOwnContactDetail(loggedInUser.key, resource.key, database).then(function (isOwn) {
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
        create: checkCreateAccessOnResource,
        update: checkUpdateAccessOnResource,
        delete: checkDeleteAccessOnResource,
        table: 'messagecontactdetails'
      });
  }

  var ret = {
    type: '/messagecontactdetails',
    public: false,
    secure: [
      checkAccessOnResource
    ],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'Messages can have contact details associated. These are scoped in the lifetime of the message.',
      type: 'object',
      properties: {
        message: $s.permalink('/messages', 'The message the contactdetail belongs to.'),
        contactdetail: $s.permalink('/contactdetails', 'The contactdetail that is associated with the message.')
      },
      required: ['message', 'contactdetail']
    },
    map: {
      key: {},
      message: {
        references: '/messages'
      },
      contactdetail: {
        references: '/contactdetails'
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
