var common = require('./common.js');

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  var ret = {
    type: '/partyrelations',
    'public': true, // eslint-disable-line
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A relationship between two parties that are using a mutual credit system.' +
        ' The type of relationship, together with the types of parties involved determines the semantics ' +
        'of the relationship. For example : when a person is a member of a group, this has a different meaning ' +
        'from a group being member of a connector. Connector groups are used to allow 2 communities of ' +
        'mutual credit users to exchange currency.',
      type: 'object',
      properties: {
        from: {
          references: '/parties'
        },
        to: {
          references: '/parties'
        },
        type: {
          type: 'string',
          description: 'The type of relationship. Currently "member" and "adminsitrator" are in use.',
          enum: ['member', 'administrator']
        },
        balance: $s.numeric(
          'The balance (currency) of party A in his relationship with party B. Positive means party "from" has ' +
          'credit, negative means party "from" has debt.'
        ),
        status: {
          type: 'string',
          description: 'The status of this relation. Is it active / inactive ?',
          enum: ['active', 'inactive']
        }
      },
      required: ['from', 'to', 'type', 'balance', 'status']
    },
    validate: [],
    query: {
      from: $q.filterReferencedType('/parties', 'from'),
      to: $q.filterReferencedType('/parties', 'to'),
      defaultFilter: $q.defaultFilter
    },
    map: {
      key: {},
      from: {
        references: '/parties'
      },
      to: {
        references: '/parties'
      },
      type: {},
      balance: {},
      status: {}
    },
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
