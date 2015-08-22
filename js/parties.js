exports = module.exports = function (sri4node) {
  'use strict';
  var $u = sri4node.utils,
    $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  function parentsOf(value, select) {
    var permalinks = value.split(',');

    var keys = [], nonrecursive, recursive;

    permalinks.forEach(function (permalink) {
      var key = permalink.split('/')[2];
      keys.push(key);
    });

    nonrecursive = $u.prepareSQL();
    recursive = $u.prepareSQL();

    nonrecursive.sql('VALUES ');
    keys.forEach(function (key, index) {
      if (index !== 0) {
        nonrecursive.sql(',');
      }
      nonrecursive.sql('(').param(key).sql('::uuid)');
    });

    recursive.sql('SELECT r.to FROM partyrelations r, search_relations s where r."from" = s.key and r.type=\'member\'');
    select.with(nonrecursive, 'UNION', recursive, 'search_relations(key)');
    select.sql(' AND key IN (SELECT key FROM search_relations) ');
    select.sql(' AND key NOT IN (').array(keys).sql(') ');
  }

  function reachableFrom(value, select) {
    var permalinks = [],
      keys = [],
      nonrecursive = $u.prepareSQL(),
      recursive = $u.prepareSQL(),
      nr2 = $u.prepareSQL(),
      r2 = $u.prepareSQL();

    permalinks = value.split(',');

    permalinks.forEach(function (permalink) {
      var key = permalink.split('/')[2];
      keys.push(key);
    });

    nonrecursive.sql('VALUES ');
    keys.forEach(function (key, index) {
      if (index !== 0) {
        nonrecursive.sql(',');
      }
      nonrecursive.sql('(').param(key).sql('::uuid)');
    });

    recursive.sql('select r.to FROM partyrelations r, parentsof s where r."from" = s.key and r.type = \'member\'');
    select.with(nonrecursive, 'UNION', recursive, 'parentsof(key)');
    nr2.sql('SELECT key FROM parentsof');
    r2.sql('SELECT r."from" FROM partyrelations r, childrenof c where r."to" = c.key and r.type = \'member\'');
    select.with(nr2, 'UNION', r2, 'childrenof(key)');
    select.sql(' AND key IN (SELECT key FROM childrenof) ');
  }

  function childrenOf(value, select) {
    var permalinks, keys = [],
      nonrecursive = $u.prepareSQL(),
      recursive = $u.prepareSQL();

    permalinks = value.split(',');
    permalinks.forEach(function (permalink) {
      var key = permalink.split('/')[2];
      keys.push(key);
    });

    nonrecursive.sql('VALUES ');
    keys.forEach(function (key, index) {
      if (index !== 0) {
        nonrecursive.sql(',');
      }
      nonrecursive.sql('(').param(key).sql('::uuid)');
    });

    recursive.sql('SELECT r."from" FROM partyrelations r, childrenof c where r."to" = c.key and r.type = \'member\'');
    select.with(nonrecursive, 'UNION', recursive, 'childrenof(key)');
    select.sql(' AND key IN (SELECT key FROM childrenof) ');
  }

  return {
    // Base url, maps 1:1 with a table in postgres
    // Same name, except the '/' is removed
    type: '/parties',
    // Is this resource public ?
    // Can it be read / updated / inserted publicly ?
    'public': true, // eslint-disable-line
    // Multiple function that check access control
    // They receive a database object and
    // the security context of the current user.
    secure: [
            //checkAccessOnResource,
            //checkSomeMoreRules
        ],
    // Standard JSON Schema definition.
    // It uses utility functions, for compactness.
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A person, organisations, subgroup, group, connectorgroup, etc... ' +
        'participating in a mutual credit / knowledge exchange system.',
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'The type of party this resource describes.',
          'enum': ['person', 'organisation', 'subgroup', 'group', 'connector']
        },
        name: $s.string(
          'The name of the party. If it is a person with a christian name you should store ' +
          '[firstname initials/middlename lastname]. As there is no real universal format for naming people, ' +
          'we do not impose one here. (Like making 2 fields, firstname and lastname would do)'
        ),
        alias: $s.string('Handle the party wants to be known by.'),
        dateofbirth: $s.timestamp('Date of birth for people. Other types of parties don\'t have a date of birth.'),
        imageurl: $s.string('URL to a profile image for people, a logo for groups, etc...'),
        login: $s.string('Login for accessing the API. Only people have a login.', 3),
        password: $s.string(
          'Password for accessing the API. Only people have a password. A group is managed by a person that has ' +
          'a relation of type "administrator" with that group.',
          3),
        secondsperunit: $s.numeric(
          'If the party is a group, and it is using the mutual credit system as a time-bank (i.e. agreements with ' +
          'the members exist about using time as currency), then this value expresses the number units per second.'
        ),
        currencyname: $s.string('The name of the currency, as used by a group'),
        status: {
          type: 'string',
          description: 'The status of this party. Is it active / inactive',
          'enum': ['active', 'inactive']
        }
      },
      required: ['type', 'name', 'status']
    },
    // Functions that validate the incoming resource
    // when a PUT operation is executed.
    validate: [
            //validateAuthorVersusThemes
        ],
    // Supported URL parameters are configured
    // this allows filtering on the list resource.
    query: {
      parentsOf: parentsOf,
      reachableFrom: reachableFrom,
      childrenOf: childrenOf,
      defaultFilter: $q.defaultFilter
    },
    // All columns in the table that appear in the
    // resource should be declared.
    // Optionally mapping functions can be given.
    map: {
      key: {},
      type: {},
      name: {},
      alias: {
        onread: $m.removeifnull
      },
      dateofbirth: {
        onread: $m.removeifnull
      },
      imageurl: {
        onread: $m.removeifnull
      },
      login: {
        onread: $m.removeifnull
      },
      password: {
        onread: $m.remove
      },
      secondsperunit: {
        onread: $m.removeifnull
      },
      currencyname: {
        onread: $m.removeifnull
      },
      status: {}
    },
    // After update, insert or delete
    // you can perform extra actions.
    afterread: [
            $u.addReferencingResources('/partycontactdetails', 'party', '$$partycontactdetails')
        ],
    afterupdate: [],
    afterinsert: [],
    afterdelete: [
            //cleanupFunction
        ]
  };
};
