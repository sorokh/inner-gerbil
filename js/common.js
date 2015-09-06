
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
  }
};

