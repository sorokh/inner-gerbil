var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  function isOwnPartyContactDetail(partyId, partycontactdetailId, database) {
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnPartyContactDetail');
    q.sql('select * from partycontactdetails pc where pc.key = ').param(partycontactdetailId);
    q.sql(' and pc.party=').param(partyId);
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

  function isLinkableContactDetail(partyId, contactdetailId, database) {
    var deferred = Q.defer();
    var q;
    /*
    check if relation is already available and if it is linked to self!
    */
    q = $u.prepareSQL('isLinkableContactDetail');
    q.sql('select * from parties p, partycontactdetails pc, contactdetails c where c.key = ').param(contactdetailId);
    q.sql(' and p.key<>').param(partyId);
    q.sql(' and pc.party = p.key and pc.contactdetail = c.key');
    cl(q);
    $u.executeSQL(database, q).then(function (result) {
      cl(result.rows);
      if (result.rows.length > 0) {
        deferred.resolve(false);
      } else {
        deferred.resolve(true);
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
    if (request.body.body.party.href !== me.permalink) {
      deferred.reject('Not linking with self not allowed!');
    } else {
      isLinkableContactDetail(loggedInUser.key, resource.key, database).then(function (isOwn) {
        if (isOwn) {
          deferred.resolve(true);
        } else {
          deferred.reject('Create is not allowed!');
        }
      });
    }
    return deferred.promise;
  }

  function checkUpdateAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    isOwnPartyContactDetail(loggedInUser.key, resource.key).then(function (isOwn) {
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
    //You are allowed to update contact details if they are you contactdetails or if you are a superadmin?
    // First you need to fetch the contactdetails for me.
    isOwnPartyContactDetail(loggedInUser.key, resource.key).then(function (isOwn) {
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
        table: 'partycontactdetails'
      });
  }

  var ret = {
    type: '/partycontactdetails',
    public: false,
    secure: [
      checkAccessOnResource
    ],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'Parties can have contact details associated. These are scoped in the lifetime of the party.',
      type: 'object',
      properties: {
        party: $s.permalink('/parties', 'The party the contactdetail belongs to.'),
        contactdetail: $s.permalink('/contactdetails', 'The contactdetail that is associated with the party.')
      },
      required: ['party', 'contactdetail']
    },
    map: {
      key: {},
      party: {
        references: '/parties'
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
