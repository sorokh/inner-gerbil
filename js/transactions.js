var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils,
    $u = sri4node.utils;

  function involvingParties(value, select) {
    var permalinks = value.split(',');
    var keys = [];

    permalinks.forEach(function (permalink) {
      var key = permalink.split('/')[2];
      keys.push(key);
    });

    select.sql(' and ("from" in (').array(keys).sql(') or "to" in (').array(keys).sql(')) ');
  }

  function involvingDescendantsOfParties(value, select) {
    common.descendantsOfParties($u, value, select, 'descendantsOfParties');
    select.sql(' and ("from" in (select key from descendantsOfParties)' +
               ' or "to" in (select key from descendantsOfParties)) ');
  }

  function involvingAncestorsOfParties(value, select) {
    common.ancestorsOfParties($u, value, select, 'ancestorsOfParties');
    select.sql(' and ("from" in (select key from ancestorsOfParties)' +
               ' or "to" in (select key from ancestorsOfParties)) ');
  }

  function fromDescendantsOfParties(value, select) {
    common.descendantsOfParties($u, value, select, 'descendantsOfParties');
    select.sql(' and "from" in (select key from descendantsOfParties) ');
  }

  function toDescendantsOfParties(value, select) {
    common.descendantsOfParties($u, value, select, 'descendantsOfParties');
    select.sql(' and "to" in (select key from descendantsOfParties) ');
  }

  function isOwnTransaction(database, me, resource) {
    var transactionId = resource.key;
    var partyId = me.key;
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnTransaction');
    q.sql('select t.key as key from transactions t where t.key = ').param(transactionId);
    q.sql(' and t.from=').param(partyId);

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

  function checkReadAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var q, recursive, nonrecursive;
    var loggedInUser = me;
    var transactionId = resource.key;
    if (!transactionId) {
      //List is requested so we rely on the filtering after read.
      deferred.resolve(true);
    } else {
      //You are allowed to read a transaction if you contribute in the transaction
      // or if you are a superadmin
      // or if you are a member of the group wherein the transaction was done
      
      isOwnTransaction(database, loggedInUser, resource).then(function (isOwn) {
        if (isOwn) {
          deferred.resolve(true);
        } else {
          nonrecursive = $u.prepareSQL();
          nonrecursive.sql('select distinct pr.from, pr.to, p.type from transactionrelations tr, ');
          nonrecursive.sql('parties p, partyrelations pr where tr.partyrelation = pr.key ');
          nonrecursive.sql('and pr.from  p.key and t."$$meta.deleted" <> true and pr.type=');
          nonrecursive.param('member');
          nonrecursive.sql('and tr.transaction = ').param(transactionId);
          recursive = $u.prepareSQL();
          recursive.sql('select distinct p.key, p.key, p.type from parties p, partyrelations pr, ');
          recursive.sql('accesiblepartiesForTransaction a where   a.party = pr.to and ');
          recursive.sql('a.type <> ').param('person');
          recursive.sql('and a.type <> ').param('organisation');
          recursive.sql('and pr.type = ').param('member');
          recursive.sql('and pr.from = p.key');
          recursive.sql('and pr.status = ').party('active');
          q = $u.prepareSQL();
          q.with(nonrecursive, 'UNION', recursive, 'accesiblepartiesForTransaction(key, party, type)');
          q.sql('select distinct a.key from accesiblepartiesForTransaction a');
          q.sql(' where a.key = ').param(me.key);
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
        }
      });
    }
    return deferred.promise;
  }

  function checkAccessOnResource(request, response, database, me, batch) {
    return security.checkAccessOnResource($u, request, response, database, me, batch,
      {
        read: checkReadAccessOnResource,
        isOwn: isOwnTransaction,
        table: 'messages'
      });
  }

  var ret = {
    type: '/transactions',
    public: false,
    secure: [
      checkAccessOnResource
    ],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A transaction between two parties in a mutual credit system.',
      type: 'object',
      properties: {
        from: $s.permalink('/parties', 'The party that provides mutual credit.'),
        to: $s.permalink('/parties', 'The party that receives mutual credit.'),
        amount: $s.numeric('The amount of credit. If this is a time-bank it is expressed in seconds.'),
        description: $s.string('A short messages accompanying the transaction.')
      },
      required: ['from', 'to', 'amount']
    },
    map: {
      key: {},
      from: {
        references: '/parties'
      },
      to: {
        references: '/parties'
      },
      amount: {},
      description: {
        onread: $m.removeifnull
      }
    },
    validate: [],
    query: {
      from: $q.filterReferencedType('/parties', 'from'),
      to: $q.filterReferencedType('/parties', 'to'),
      involvingParties: involvingParties,

      forMessages: common.filterRelatedManyToMany($u, 'messagetransactions', 'transaction', 'message'),

      involvingAncestorsOfParties: involvingAncestorsOfParties,
      involvingDescendantsOfParties: involvingDescendantsOfParties,

      fromDescendantsOfParties: fromDescendantsOfParties,
      toDescendantsOfParties: toDescendantsOfParties,
      defaultFilter: $q.defaultFilter
    },
    queryDocs: {
      from: 'Returns transactions where the originator is one of a list of ' +
        '(comma separated) parties.',
      to: 'Returns transactions benefitting one of a list of ' +
        '(comma separated) parties.',
      involvingParties: 'Returns transactions where on of a (comma separated) ' +
        'list of parties is involved (either as originator or as beneficiary).',

      forMessages: 'Returns transactions that are associated with one of a list ' +
        'of (comma separated) messages.',

      involvingAncestorsOfParties: 'Returns transactions involving any ' +
        'direct or indirect parents (via an "is member of" relation) of a ' +
        'comma separated list of parties.',
      involvingDescendantsOfParties: 'Returns transactions involving any ' +
        'direct or indirect members of a comma separated list of parties.',

      fromDescendantsOfParties: 'Returns transactions originating from any ' +
        'direct or indirect member of a comma separated list of parties.',
      toDescendantsOfParties: 'Returns transaction benefitting any ' +
        'direct or indirect member of a comma separated list of parties.'
    },
    afterread: [
      common.addRelatedManyToMany($u, 'messagetransactions', 'transaction', 'message',
                                  '/messages', '$$messages')
    ],
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
