var common = require('./common.js');

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  var ret = {
    type: '/transactionrelations',
    public: false,
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'Expresses that a /partyrelation (which has a balance) was affected by a transaction. ' +
        'Its balance was altered by the mentioned transaction. ' +
        'For every transaction in the system these resources ' +
        'provide a record of the details on how the transaction ' +
        'was routed over (possibly multiple) subgroups, groups, connector groups, etc..',
      type: 'object',
      properties: {
        transaction: $s.permalink('/transactions', 'The transaction this part belongs to.'),
        partyrelation: $s.permalink('/partyrelations', 'The relation that was affected by the transaction.'),
        amount: $s.numeric('The amount of credit. If this is a time-bank it is expressed in seconds.')
      },
      required: ['transaction', 'partyrelation', 'amount']
    },
    map: {
      key: {},
      transaction: {
        references: '/transactions'
      },
      partyrelation: {
        references: '/partyrelations'
      },
      amount: {}
    },
    validate: [],
    query: {
      transaction: $q.filterReferencedType('/transactions', 'transaction'),
      partyrelation: $q.filterReferencedType('/partyrelations', 'relation'),
      defaultFilter: $q.defaultFilter
    },
    queryDocs: {
      transaction: 'Returns /transactionrelations for a (comma separated) list' +
        'of transactions.',
      partyrelation: 'Returns /transactionrelations for a (comma separated) list ' +
        'of /partyrelations (i.e.: a membership of party A in party B)'
    },
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
