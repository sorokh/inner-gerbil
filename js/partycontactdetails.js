exports = module.exports = function (sri4node, cacheconfig) {
  'use strict';
  var $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  return {
    type: '/partycontactdetails',
    'public': true, // eslint-disable-line
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'Parties can have contact details associated. These are scoped in the lifetime of the party.',
      type: 'object',
      properties: {
        party: $s.permalink('/parties', 'The party the contactdetail belongs to.'),
        contactdetail: $s.permalink('/contactdetails', 'The contactdetail that is associated with the party.')
      },
      required: ['party', 'contactdetail']
    },
    map: {
      key: {},
      party: {
        references: '/parties'
      },
      contactdetail: {
        references: '/contactdetails'
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
