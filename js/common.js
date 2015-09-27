var Q = require('q');

exports = module.exports = {
  cl: function (x) {
    'use strict';
    console.log(x); // eslint-disable-line
  },

  /* Merge all direct properties of object 'source' into object 'target'. */
  objectMerge: function (target, source) {
    'use strict';
    var key;
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  },

  /*
  A query function that traverses a many-to-many relationship.
   */
  filterRelatedManyToMany: function ($u, relationTable, localColumn, remoteColumn) {
    'use strict';
    return function (value, select) {
      var q = $u.prepareSQL();

      var links, keys, key;
      keys = [];
      links = value.split(',');
      links.forEach(function (link) {
        key = link.split('/')[2];
        keys.push(key);
      });

      q.sql('select "' + localColumn + '" from "' + relationTable + '" where "' + remoteColumn + '" in (')
          .array(keys).sql(')');
      var cteName = 'related' + relationTable + localColumn + remoteColumn;
      select.with(q, cteName);
      select.sql(' and key in (select "' + localColumn + '" from ' + cteName + ') ');
    };
  },

  /*
  returns an afterread function that adds the other side of a many-to-many resource.
  */
  addRelatedManyToMany: function ($u, relationTable, localKey, remoteKey, remoteType, resourceTargetKey) {
    'use strict';
    return function (database, elements) {
      var deferred = Q.defer();

      var element;
      var keys = [];
      var keyToElement = {};
      elements.forEach(function (e) {
        keys.push(e.key);
        keyToElement[e.key] = e;
      });

      var q = $u.prepareSQL();
      q.sql('select ' + remoteKey + ',' + localKey +
            ' from ' + relationTable + ' where ' + localKey + ' in (').array(keys).sql(')');
      $u.executeSQL(database, q).then(function (results) {
        results.rows.forEach(function (row) {
          element = keyToElement[row[localKey]];
          if (!element[resourceTargetKey]) {
            element[resourceTargetKey] = [];
          }
          element[resourceTargetKey].push({href: remoteType + '/' + row[remoteKey]});
        });
        deferred.resolve();
      }).fail(function () {
        deferred.reject();
      });

      return deferred.promise;
    };
  },

  /*
  Extends the give SQL 'select' to restrict on parent of 'value'
   */
  ancestorsOfParties: function ($u) {
    'use strict';
    return function (value, select) {
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

      recursive.sql('SELECT r.to FROM partyrelations r, search_relations s ' +
          'where r."from" = s.key and r.type=\'member\'');
      select.with(nonrecursive, 'UNION', recursive, 'search_relations(key)');
      select.sql(' AND key IN (SELECT key FROM search_relations) ');
      select.sql(' AND key NOT IN (').array(keys).sql(') ');
    };
  },

  /*
  Adds a CTE to the given select query, and created a virtual table that
  has a single column (the key) of all descendants (recursively) of the given
  value (a comma-separated list of permalinks to /parties).
  */
  descendantsOfParties: function ($u, value, select, virtualtablename) {
    'use strict';
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

    recursive.sql('SELECT r."from" FROM partyrelations r, ' + virtualtablename + ' c ' +
                  'where r."to" = c.key and r.type = \'member\'');
    select.with(nonrecursive, 'UNION', recursive, virtualtablename + '(key)');
  },

  /*
  Adds a CTE to the given select query, and created a virtual table that
  has a single column (the key) of all descendants (recursively) of the given
  value (a comma-separated list of permalinks to /messages).
  */
  descendantsOfMessages: function ($u, value, select, virtualtablename) {
    'use strict';
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

    recursive.sql('SELECT r."from" FROM messagerelations r, ' + virtualtablename + ' c ' +
                  'where r."to" = c.key');
    select.with(nonrecursive, 'UNION', recursive, virtualtablename + '(key)');
  },

  reachableFromParties: function ($u, value, select, virtualtablename) {
    'use strict';
    var permalinks,
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

    recursive.sql('select r.to FROM partyrelations r, ' + virtualtablename +
                  'parentsof s where r."from" = s.key and r.type = \'member\'');
    select.with(nonrecursive, 'UNION', recursive, virtualtablename + 'parentsof(key)');
    nr2.sql('SELECT key FROM ' + virtualtablename + 'parentsof');
    r2.sql('SELECT r."from" FROM partyrelations r, ' + virtualtablename +
           ' c where r."to" = c.key and r.type = \'member\'');
    select.with(nr2, 'UNION', r2, virtualtablename + '(key)');
  },

  /*
  Adds a CTE to your query :
  Selects parties from 'partiestablename' that have a contactdetail with coordinates inside of
  those specified in the value (minLat,maxLat,minLong,maxLong) where are of these vales have 1 decimal digit.
  It selects the keys of the matching parties into a virtual table called 'virtualtablename'.
  */
  filterLatLong: function ($u, value, select, partiestablename, virtualtablename) {
    'use strict';
    var pattern = new RegExp('[0-9]+\.[0-9]\,[0-9]+\.[0-9]\,[0-9]+\.[0-9]\,[0-9]+\.[0-9]');
    var parts = [];
    var q;
    var error;

    if (pattern.test(value)) {
      parts = value.split(',');
      q = $u.prepareSQL('filterLatLong-' + partiestablename);
      q.sql('select party as key from partycontactdetails where contactdetail in ');
      q.sql('(select key from contactdetails ');
      q.sql('where ');
      q.sql(' key in ' +
            '(select contactdetail from partycontactdetails where party in ' +
            '(select key from ' + partiestablename + '))');
      q.sql(' and latitude > ').param(parseFloat(parts[0]));
      q.sql(' and latitude < ').param(parseFloat(parts[1]));
      q.sql(' and longitude > ').param(parseFloat(parts[2]));
      q.sql(' and longitude < ').param(parseFloat(parts[3]));
      q.sql(')');
      select.with(q, virtualtablename);
    } else {
      error = {
        code: 'invalid.syntax.lat.long.boundaries',
        description: 'Specify latitude and longitude with comma-separated values ' +
                     'that have 1 decimal digit (use dot for decimal separation). ' +
                     'Example : 50.9,51.0,4.1,4.2',
        type: 'ERROR'
      };
      throw error;
    }
  }
};
