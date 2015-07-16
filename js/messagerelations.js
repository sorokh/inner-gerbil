/*
This resource expresses relations between messages.
A message can be a response to another message.
It can be a private, or a public response, etc...
*/

exports = module.exports = function (sri4node) {
  'use strict';
  var $q = sri4node.queryUtils;

  return {
    type: '/messagerelations',
    'public': true, // eslint-disable-line
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A relationship between two messages. A message can be a response to another message,' +
        ' this response can be public (visible in the group), or private, etc...',
      type: 'object',
      properties: {
        from: {
          references: '/messages'
        },
        to: {
          references: '/messages'
        },
        type: {
          type: 'string',
          description: 'The type of relationship. Currently "response_private" and "response_public" are in use.',
          'enum': ['response_private', 'response_public']
        }
      },
      required: ['from', 'to', 'type']
    },
    validate: [],
    query: {
      from: $q.filterReferencedType('/messages', 'from'),
      to: $q.filterReferencedType('/messages', 'to'),
      type: $q.filterIn('type')
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
};
