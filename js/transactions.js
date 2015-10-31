var common = require('./common.js');

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

  var ret = {
    type: '/transactions',
    public: false,
    secure: [],
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
