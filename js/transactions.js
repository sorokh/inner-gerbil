var common = require('./common.js');

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils,
    $u = sri4node.utils;

  function involvingParties (value, select) {
    var permalinks = value.split(',');
    var keys = [];

    permalinks.forEach(function (permalink) {
      var key = permalink.split('/')[2];
      keys.push(key);
    });

    select.sql(' and ("from" in (').array(keys).sql(') or "to" in (').array(keys).sql(')) ');
  }

  function involvingDescendantsOfParties (value, select) {
    common.descendantsOfParties($u, value, select, 'descendantsOfParties');
    select.sql(' and "from" in (select key from descendantsOfParties)' +
               ' or "to" in (select key from descendantsOfParties) ');
  }

  var ret = {
    type: '/transactions',
    'public': true, // eslint-disable-line
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
      forMessages: common.filterRelatedManyToMany($u, 'messagetransactions', 'transaction', 'message'),
      involvingParties: involvingParties,
      involvingDescendantsOfParties: involvingDescendantsOfParties,
      defaultFilter: $q.defaultFilter
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
