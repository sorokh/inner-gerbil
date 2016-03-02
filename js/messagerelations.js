var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $q = sri4node.queryUtils;

  function isOwnMessageRelation(database, me, resource) {
    var messageRelationId = resource.key;
    var partyId = me.key;
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

  function isLinkableMessage(me, messageRelation, database) {
    var deferred = Q.defer();
    var q;
    /*
    check if relation is already available and if it is linked to self!
    */
    q = $u.prepareSQL('isLinkableMessage');
    q.sql('select m.key from messages m, messagesrelations mr where mr.key = ').param(messageRelation);
    q.sql(' and mr.');
    //TODO: define correct query
    // Select all messagerelation for message where to and from is the same -> must be 0
    // I must be owner of the from message
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
    /**
    I can create a relation from a message of my own to a message to which I have access.
    Unless an active relation already exists. 
    As a superadmin I'm allowed to create a relation between any message.
    */
    var deferred = Q.defer();
    if (request.body.body.party.href !== me.permalink) {
      deferred.reject('Not linking with self not allowed!');
    } else {
      isLinkableMessage(me, resource, database).then(function (isOwn) {
        if (isOwn) {
          deferred.resolve(true);
        } else {
          deferred.reject('Create is not allowed!');
        }
      });
    }
    return deferred.promise;
  }

  function checkAccessOnResource(request, response, database, me, batch) {
    return security.checkAccessOnResource($u, request, response, database, me, batch,
      {
        create: checkCreateAccessOnResource,
        isOwn: isOwnMessageRelation,
        table: 'messagesrelations'
      });
  }
  
  function filterAccessible() {
    /*
    Unless you are a superadmin
    you should only have access to your own messagerelations
    or public responses to messages that are accessible to you
    */
    return function (database, elements, me) {
      var messageRelationRefs = [];
      var deferred = Q.defer();
      var nonrecursive, recursive, select;
      var messageRelations = elements || [];
      var keys = [];
      var keyToElement = {};
      messageRelations.forEach(function (e) {
        keys.push(e.key);
        keyToElement[e.key] = e;
      });
      if (common.isSuperUser(me)) {
        deferred.resolve(messageRelations);
      } else {
        /* select the messages for which I'm not the author and for
        which I don't have the publishedToParty in my reacheable party graph and remove them*/
        messageRelationRefs = [];
        messageRelations.forEach(
          function (messageRelation) {
            messageRelationRefs.push(me.key);
          });
        select = $u.prepareSQL();
        nonrecursive = $u.prepareSQL();
//TODO: create correct filtering statement
        nonrecursive.sql('select distinct c.key as key,p.key as owner from contactdetails c, ' +
        'partycontactdetails pc, parties p where c.public = true and ' +
        'pc.contactdetail=c.key and pc.party <>').param(me.key)
        .sql('and c.key in (').array(keys).sql(')');

        recursive = $u.prepareSQL();
        recursive.sql('select s.key,r.to FROM partyrelations r, accesibleparties s ' +
        'where r."from" = s.party and r.type = \'member\' and r.status=\'active\'');

        select.with(nonrecursive, 'UNION', recursive, 'accesibleparties(key,party)');

        select.sql('select distinct ac.key from accesibleparties ac')
        .sql(' UNION ')
        .sql('select distinct c.key from contactdetails c, partycontactdetails pc ' +
        'where c.public = false and pc.contactdetail = c.key and pc.party <> ').param(me.key);

        cl(select);
        $u.executeSQL(database, select).then(function (result) {
          cl(result.rows);
          result.forEach(
              function (row) {
                delete keyToElement[row.key];
              });
          elements = elements.filter(
            function (element) {
              var value;
              if (keyToElement[element.key]) {
                value = true;
              } else {
                value = false;
              }
              return value;
            }
          );
          deferred.resolve(elements);
        }).catch(function (e) {
          cl(e);
          deferred.resolve(false);
        });
      }
      return deferred.promise;
    };
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
