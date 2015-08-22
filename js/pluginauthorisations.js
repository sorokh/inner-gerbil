exports = module.exports = function (sri4node) {
  'use strict';
  var $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  return {
    type: '/pluginauthorisations',
    'public': true, // eslint-disable-line
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'An authorisations giving a certain plugin access ' +
        'to the information of the party that granted authorisation.',
      type: 'object',
      properties: {
        plugin: $s.permalink('/plugins', 'The plugin that is granted access'),
        party: $s.permalink('/parties', 'The party\'s information being granted access to')
      },
      required: ['plugin', 'party']
    },
    map: {
      key: {},
      plugin: {references: '/plugins'},
      party: {references: '/parties'}
    },
    validate: [],
    query: {
      plugin: $q.filterReferencedType('/plugins', 'plugin'),
      party: $q.filterReferencedType('/parties', 'party'),
      defaultFilter: $q.defaultFilter
    },
    querydocs: {
      plugin: 'Limit the list to authorisations for one plugin only. ' +
        'You can filter on more than one plugin by comma-seperating multiple permalinks.',
      party: 'Limit the list to authorisations for a party. ' +
        'You can filter on more than one plugin by comma-seperating multiple permalinks.'
    },
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };
};
