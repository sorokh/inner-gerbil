exports = module.exports = function (sri4node) {
  'use strict';
  var $s = sri4node.schemaUtils;

  return {
    type: '/messageparties',
    'public': true,
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'Messages can be posted in more than one group/subgroup.' +
        'This resource expresses the relationship between a messages and the party where the message is posted.',
      type: 'object',
      properties: {
        message: $s.permalink('/messages',
          'The message that was posted.'),
        party: $s.permalink('/parties',
          'The party where a message was posted.')
      },
      required: ['message', 'party']
    },
    map: {
      message: {
        references: '/messages'
      },
      party: {
        references: '/parties'
      }
    },
    validate: [],
    query: {},
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };
};
