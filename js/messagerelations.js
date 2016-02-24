var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $q = sri4node.queryUtils;

  function isOwnMessageRelation(partyId, messageRelationId, database) {
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnMessageRelation');
    q.sql('select * from messagesrelations mr, messages m where mr.key = ').param(messageRelationId);
    q.sql(' and mr.from = m.key and  m.author=').param(partyId);
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

  function isLinkableMessage(partyId, messageId, database) {
    var deferred = Q.defer();
    var q;
    /*
    check if relation is already available and if it is linked to self!
    */
    q = $u.prepareSQL('isLinkableMessage');
    //TODO: define correct query
    /*q.sql('select * from parties p, partycontactdetails pc, contactdetails c where c.key = ').param(contactdetailId);
    q.sql(' and p.key<>').param(partyId);
    q.sql(' and pc.party = p.key and pc.contactdetail = c.key');
    cl(q);
    $u.executeSQL(database, q).then(function (result) {
      cl(result.rows);
      if (result.rows.length > 0) {
        deferred.resolve(false);
      } else {*/
        deferred.resolve(true);
    /*  }
    }).catch(function (e) {
      cl(e);
      deferred.resolve(false);
    });*/
    return deferred.promise;
  }

  function checkCreateAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    if (request.body.body.party.href !== me.permalink) {
      deferred.reject('Not linking with self not allowed!');
    } else {
      isLinkableMessage(loggedInUser.key, resource.key, database).then(function (isOwn) {
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
    isOwnMessageRelation(loggedInUser.key, resource.key).then(function (isOwn) {
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
    isOwnMessageRelation(loggedInUser.key, resource.key).then(function (isOwn) {
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
        table: 'messagesrelations'
      });
  }

  var ret = {
    type: '/messagerelations',
    public: false,
    secure: [
      checkAccessOnResource
    ],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A relationship between two messages. A message can be a response to another message,' +
        ' this response can be public (visible in the group), or private, etc...',
      type: 'object',
      properties: {
        key: {},
        from: {
          references: '/messages'
        },
        to: {
          references: '/messages'
        },
        type: {
          type: 'string',
          description: 'The type of relationship. Currently messages can be private or public responses to a ' +
            'top level message. For now reponses can not be given to other responses. This may be extended in the ' +
            'future.',
          enum: ['response_private', 'response_public']
        }
      },
      required: ['from', 'to', 'type']
    },
    validate: [],
    query: {
      to: $q.filterReferencedType('/messages', 'to'),
      defaultFilter: $q.defaultFilter
    },
    queryDocs: {
      to: 'Returns all responses to a (comma separated) list of messages.'
    },
    map: {
      from: {
        references: '/messages'
      },
      to: {
        references: '/messages'
      },
      type: {}
    },
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
