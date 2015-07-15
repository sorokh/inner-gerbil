exports = module.exports = function (sri4node) {
  'use strict';
  var $s = sri4node.schemaUtils;

  return {
    type: '/messagecontactdetails',
    'public': true,
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'Messages can have contact details associated. These are scoped in the lifetime of the message.',
      type: 'object',
      properties: {
        message: $s.permalink('/messages', 'The message the contactdetail belongs to.'),
        contactdetail: $s.permalink('/contactdetails', 'The contactdetail that is associated with the message.')
      },
      required: ['message', 'contactdetail']
    },
    map: {
      message: {
        references: '/messages'
      },
      contactdetail: {
        references: '/contactdetails'
      }
    },
    validate: [],
    query: {},
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };
};
