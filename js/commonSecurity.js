/* Security Manager for inner gerbil domain model */

var Q = require('q');
var common = require('./common.js');
var cl = common.cl;
var defaultConfig;

var doesExist = function () {
  'use strict';
  var deferred = Q.defer();
  deferred.resolve(true);
  return deferred.promise;
};

var checkExists = function ($u, database, me, resource, table) {
  'use strict';
  var deferred = Q.defer();
  var q;
  if (!resource || !table) {
    doesExist().then(
      function () {deferred.resolve(true); }, function () {deferred.resolve(false); });
  } else {
    /* check if this is an update of a create */
    q = $u.prepareSQL('check-' + table + '-exists');
    q.sql('select count("key") from "' + table + '" where key= ')
        .param(resource.key);
    cl(q);
    $u.executeSQL(database, q).then(function (result) {
      cl(result.rows);
      //handle resource update
      if (result.rows[0].count > 0) {
        //update
        cl('triggering update of: ' + resource);
        deferred.resolve(true);
      } else /*Resource Creation*/{
        cl('triggering create of: ' + resource);
        deferred.resolve(false);
      }
    });
  }
  return deferred.promise;
};

exports = module.exports = {
  hasRole: function (me, role, object) {
    'use strict';
  },

  isSuperUser: function (me) {
    'use strict';
    switch (me.adminrole) {
    case 'all':
      return true;
    case 'none':
    default:
      return false;
    }
  },
    /**
   * Syntactic sugar method to get a more functional interface in the context of
   * security.
   * Remark this method always returns a rejected promise with as value the passed
   * reason string.
  */
  rejectAccess: function (reason, deferred) {
    'use strict';
    var def = deferred || Q.defer();
    cl('rejected: ' + reason);
    def.reject(reason);
    return deferred || def.promise;
  },

  /**
   * Syntactic sugar method to get a more functional interface in the context of
   * security.
   * Remark this method always returns a resolved promise with value 'true'
  */
  approveAccess: function () {
    'use strict';
    var def = Q.defer();
    def.resolve(true);
    return def.promise;
  },

  isOwn: function (database, me, resource) {
    'use strict';
    return exports.approveAccess();
  },
  
  ownerBasedAccessOnResource: function (message,errormessage){
    return function (request, response, database, me, resource, config) {
      'use strict';
      var deferred = Q.defer();
      var resolved = function () {
        cl('resolved');
        deferred.resolve(true);
      };
      var nonAuthorized = function () {
        cl('rejected');
        deferred.reject(message);
      };
      (config.isOwn || defaultConfig.isOwn)(database, me, resource).then(function (isOwn) {
        if (isOwn) {
          resolved();
        } else {
          exports.rejectAccess(message, deferred);
        }
      }, function (error) {
        cl(errormessage + ' ' + error);
        nonAuthorized();
      });
      return deferred.promise;
    }
  },

  checkAccessOnResource: function ($u, request, response, database, me, batch, config) {
    'use strict';
    var deferred = Q.defer();
    var resolved = function () {
      cl('resolved');
      deferred.resolve(true);
    };
    var nonAuthorized = function () {
      cl('rejected');
      deferred.reject('Non Authorized!');
    };
    var resource = {};
    if (!config) {
      config = {};
    }
    if (batch) {
      resource.key = common.uuidFromPermalink(batch.href);
      resource.permalink = batch.href;
      resource.type = batch.body.type;
    } else {
      resource.key = request.params.key;
      resource.permalink = request.url;
      resource.type = request.body.type;
    }
    if (exports.isSuperUser(me)) {
      cl('Super User Access');
      resolved();
    }
    switch (request.method) {
    case 'GET':
      cl('GET');
      (config.read || defaultConfig.read)(request, response, database, me, resource)
        .then(function () {resolved(); },
          function () {nonAuthorized(); }
        );
      break;
    case 'PUT':
      cl('PUT');
      (config.exists || defaultConfig.exists)($u, database, me, resource, config.table)
        .then(
          function (exists) {
            if (exists) {
              cl('UPDATE');
              (config.update || defaultConfig.update)(request, response, database, me, resource, config)
                .then(function () {resolved(); },
                  function (error) {
                    cl('E0: Error Occurred: ' + error);
                    nonAuthorized();
                  });
            } else {
              cl('CREATE');
              (config.create || defaultConfig.create)(request, response, database, me, resource)
                .then(
                  function () {resolved(); },
                  function (error) {
                    cl('E1: Error Occurred: ' + error);
                    nonAuthorized();
                  });
            }
          }, function (error) {
            cl('E2: Error Occurred: ' + error);
            nonAuthorized();
          }
        );
      break;
    case 'DELETE':
      cl('DELETE');
      (config.delete || defaultConfig.delete)(request, response, database, me, resource, config)
        .then(function () {resolved(); }, function () {nonAuthorized(); });
      break;
    default:
      cl('UNSUPPORTED METHOD');
      nonAuthorized();
      break;
    }
    return deferred.promise;
  }
};

/**
 * Default access policy :
 *  Allow read for all
 *  Allow create by all
 *  Allow update/delete by superuser and owners.
 */
defaultConfig = {
  create: exports.approveAccess,
  read: exports.approveAccess,
  update: exports.ownerBasedAccessOnResource('Update is not allowed!', 'CSU1: Error Occurred:'),
  delete: exports.ownerBasedAccessOnResource('Delete is not allowed!', 'CSD1: Error Occurred: '),
  isOwn: exports.isOwn,
  exists: checkExists
};
