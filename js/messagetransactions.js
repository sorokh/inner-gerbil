exports = module.exports = function (sri4node, cacheconfig) {
  'use strict';
  var $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  return {
    type: '/messagetransactions',
    'public': true, // eslint-disable-line
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'When a transaction is created, and we know it relates to a certain message,' +
        ' we create one or more /messagetransactions resource.',
      type: 'object',
      properties: {
        message: $s.permalink('/messages', 'The message.'),
        transaction: $s.permalink('/transactions', 'The related transaction.')
      },
      required: ['message', 'transaction']
    },
    map: {
      key: {},
      message: {
        references: '/messages'
      },
      transaction: {
        references: '/transactions'
      }
    },
    validate: [],
    query: {
      defaultFilter: $q.defaultFilter
    },
    afterupdate: [],
    afterinsert: [],
    afterdelete: [],
    cache: cacheconfig
  };
};
