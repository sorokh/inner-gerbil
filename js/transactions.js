exports = module.exports = function (sri4node, cacheconfig) {
  'use strict';
  var $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils,
    $u = sri4node.utils;

  function forMessages(value, select) {
    var q = $u.prepareSQL();

    var links, keys, key;
    keys = [];
    links = value.split(',');
    links.forEach(function (link) {
      key = link.split('/')[2];
      keys.push(key);
    });

    q.sql('select transaction from messagetransactions where message in (')
      .array(keys).sql(')');
    select.with(q, 'relatedtransactions');
    select.sql(' and key in (select transaction from relatedtransactions) ');
  }

  return {
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
      forMessages: forMessages,
      defaultFilter: $q.defaultFilter
    },
    afterupdate: [],
    afterinsert: [],
    afterdelete: [],
    cache: cacheconfig
  };
};
