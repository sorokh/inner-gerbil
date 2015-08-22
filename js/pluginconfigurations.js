exports = module.exports = function (sri4node) {
  'use strict';
  var $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils,
    $m = sri4node.mapUtils;

  return {
    type: '/pluginconfigurations',
    'public': true, // eslint-disable-line
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A configuration of a plugin for a specific party.',
      type: 'object',
      properties: {
        plugin: $s.permalink('/plugins', 'The plugin that is being configured'),
        party: $s.permalink('/parties', 'The party this configuration belongs to'),
        data: $s.string('A json configuration object')
      },
      required: ['plugin', 'party', 'data']
    },
    map: {
      key: {},
      plugin: {references: '/plugins'},
      party: {references: '/parties'},
      data: {
        onread: $m.parse,
        oninsert: $m.stringify,
        onupdate: $m.stringify
      }
    },
    validate: [],
    query: {
      plugin: $q.filterReferencedType('/plugins', 'plugin'),
      party: $q.filterReferencedType('/parties', 'party'),
      defaultFilter: $q.defaultFilter
    },
    querydocs: {
      plugin: 'Limit the list to configurations for one plugin only. ' +
        'You can filter on more than one plugin by comma-seperating multiple permalinks.',
      party: 'Limit the list to configuration for one party only. ' +
        'You can filter on more than one plugin by comma-seperating multiple permalinks.'
    },
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };
};
