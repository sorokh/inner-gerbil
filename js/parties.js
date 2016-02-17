var Q = require('q');
var common = require('./common.js');
var bcrypt = require('bcrypt');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  function addLinks(database, elements) { /* eslint-disable-line */
    elements.forEach(function (element) {
      if (element.type && element.type !== 'person') {
        element.$$messagesPostedHere = {href: '/messages?postedInParties=' + element.$$meta.permalink};
      }
      if (element.type && element.type === 'person') {
        element.$$messagesPostedBy = {href: '/messages?postedByParties=' + element.$$meta.permalink};
        element.$$transactions = {href: '/transactions?involvingParties=' + element.$$meta.permalink};
      }
      element.$$allParents = {href: '/parties?ancestorsOfParties=' + element.$$meta.permalink};
    });
  }

  function addDirectParent(database, elements) {
    var deferred = Q.defer();

    var keys = [];
    var keyToElement = {};
    elements.forEach(function (element) {
      keys.push(element.key);
      keyToElement[element.key] = element;
    });

    var q = $u.prepareSQL('direct-parent-of-parties');
    q.sql('select "from","to" from "partyrelations" where "type" = \'member\' and "from" in (').array(keys).sql(')');
    cl(q);
    $u.executeSQL(database, q).then(function (result) {
      cl(result.rows);
      result.rows.forEach(function (row) {
        var from = row.from;
        var to = row.to;
        var element = keyToElement[from];
        if (!element.$$directParents) {
          element.$$directParents = [];
        }
        element.$$directParents.push({href: '/parties/' + to});
      });
      deferred.resolve();
    });

    return deferred.promise;
  }

  function reachableFromParties(value, select) {
    common.reachableFromParties($u, value, select, 'childrenof');
    select.sql(' and key in (select key from childrenof) ');
  }

  function descendantsOfParties(value, select) {
    common.descendantsOfParties($u, value, select, 'descendantsOfParties');
    select.sql(' and key in (select key from descendantsOfParties) ');
  }

  function ancestorsOfParties(value, select) {
    common.ancestorsOfParties($u, value, select, 'ancestorsOfParties');
    select.sql(' and key in (SELECT key FROM ancestorsOfParties) ');
  }

  function inLatLong(value, select) {
    common.filterLatLong($u, value, select, 'parties', 'latlongcontactdetails');
    select.sql(' and key in (select key from latlongcontactdetails) ');
  }

  /**
   *
   *
   */
  function validateUnicity(value, database) {
    var q;
    var deferred = Q.defer();

    switch (value.type) {
    case 'group':
    case 'subgroup':
      if (value.name) {
        q = $u.prepareSQL('count-groups-by-name');
        q.sql('select count("key") from "parties" where ("$$meta.deleted" <> true) and' +
            ' "name"= ').param(value.name)
            .sql(' and type in (').array(['group', 'subgroup']).sql(')');
        if (value.$$meta && value.$$meta.permalink) {
          q.sql('and key <>').param(value.$$meta.permalink.split('/')[2]);
        }
        cl(q);
        $u.executeSQL(database, q).then(function (result) {
          cl(result.rows);
          if (result.rows.pop().count > 0) {
            deferred.reject('Group with same name already exists');
          } else {
            deferred.resolve();
          }
        });
      } else {
        deferred.resolve();
      }
      break;
    default:
      if (value.login) {
        q = $u.prepareSQL('count-parties-by-login');
        q.sql('select count("key") from "parties" where ("$$meta.deleted" <> true) and' +
            ' "login"= ').param(value.login);
        if (value.$$meta && value.$$meta.permalink) {
          q.sql('and key <>').param(value.$$meta.permalink.split('/')[2]);
        }
        cl(q);
        $u.executeSQL(database, q).then(function (result) {
          cl(result.rows);
          if (result.rows.pop().count > 0) {
            deferred.reject('Login already exists');
          } else {
            deferred.resolve();
          }
        });
      } else {
        deferred.resolve();
      }
      break;
    }
    return deferred.promise;
  }

  function checkReadAccessOnResource(request, response, database, me, batch) {
    var deferred = Q.defer();
    return deferred.resolve();
  }

  function isModifySelf(loggedInUser, resource) {
    if (loggedInUser && (loggedInUser.permalink === resource.permalink)) {
      return true;
    }
    return false;
  }

  /**
   * Syntactic sugar method to get a more functional interface in the context of
   * security.
   * Remark this method always returns a rejected promise with as value the passed
   * reason string.
  */
  function rejectAccess(reason) {
    return Q.reject(reason);
  }

  /**
   * Syntactic sugar method to get a more functional interface in the context of
   * security.
   * Remark this method always returns a resolved promise with value 'true'
  */
  function approveAccess() {
    var deferred = Q.defer();
    deferred.resolve(true);
    return deferred.promise;
  }

  function hasPersonUpdateAccess(database, loggedInUser, resource) {
    var ret;
    if (isModifySelf(loggedInUser, resource)) {
      ret = approveAccess();
    } else {
      ret = rejectAccess('Only owner is allowed to update his records!');
    }
    return ret;
  }

  function hasGroupUpdateAccess(database, loggedInUser, resource) {
    var deferred = Q.defer();
    var q;
    //Only person who has admin role
    if (loggedInUser.key) {
      q = $u.prepareSQL('check-is-admin');
      q.sql('select * from partyrelations where "from"=').param(loggedInUser.key)
          .sql(' and "to"=').param(resource.key)
          .sql(' and "type"=').param('admin');
      cl(q);
      $u.executeSQL(database, q).then(function (result) {
        cl(result.rows);
        if (result.rows.length > 0) {
          //has admin role on group.
          cl('has admin role');
          deferred.resolve(true);
        } else {
          cl('doesn\'t have admin role!');
          deferred.reject('Only a group admin may update a group!');
        }
      }).catch(function (error) {
        deferred.reject('A failure occurred!');
      });
    }else {
      deferred.reject('User context not correctly set up for resource access!');
    }
    return deferred.promise;
  }

  function hasSubGroupUpdateAccess(database, loggedInUser, resource) {
    var deferred = Q.defer();
    var q;
    //Only person who has admin role on subgroup
    if (loggedInUser.key) {
      q = $u.prepareSQL('check-is-admin-of-subgroup');
      q.sql('select * from partyrelations where "from"=').param(loggedInUser.key)
          .sql(' and "to"=').param(resource.key)
          .sql(' and "type"=').param('admin');
      cl(q);
      $u.executeSQL(database, q).then(function (result) {
        cl(result.rows);
        if (result.rows.length > 0) {
          //had eligeable admin role
          deferred.resolve(true);
        } else {
          deferred.reject('Only a group admin may update a subgroup!');
        }
      }).catch(function (error) {
        deferred.reject('A failure occurred!');
      });
    }else {
      deferred.reject('User context not correctly set up for resource access!');
    }
    return deferred.promise;
  }

  function hasUpdateAccessOnResource(request, response, database, loggedInUser, resource) {
    var deferred = Q.defer();
    var q;
    var resolved = function () {deferred.resolve(true);};
    var nonAuthorized = function () {deferred.reject('Non Authorized!');};
    switch (resource.type) {
    case 'person':
      hasPersonUpdateAccess(database, loggedInUser, resource).then(resolved, nonAuthorized);
      break;
    case 'group':
      hasGroupUpdateAccess(database, loggedInUser, resource).then(resolved, nonAuthorized);
      break;
    case 'subgroup':
      hasSubGroupUpdateAccess(database, loggedInUser, resource).then(resolved, nonAuthorized);
      break;
    case 'connector':
      rejectAccess('Unsupported party type access.').then(resolved, nonAuthorized);
      break;
    case 'organisation':
      rejectAccess('Unsupported party type access.').then(resolved, nonAuthorized);
      break;
    default:
      rejectAccess('Unsupported party type access.').then(resolved, nonAuthorized);
      break;
    }

    return deferred.promise;
  }

  /**
   * Check if the logged in User has access to create a particular party resource.
   * The following rules apply:
   * person: Anyone can create a person only anonymous access needed.
   * group: only a loggedIn User with system admin rights can create a group
   * subgroup: only a loggegIn User with group admin right and/or system admin rights can create a subgroup
   * organization: ?
   * connector: any loggedIn User can create a c
   */
  function hasCreateAccessOnResource(request, response, database, loggedInUser, resource) {
    var deferred = Q.defer();
    var q, promise;
    var resolved = function () {deferred.resolve(true);};
    var nonAuthorized = function () {deferred.reject('Non Authorized!');};
    switch (resource.type) {
    case 'person':
      approveAccess().then(resolved, nonAuthorized);
      break;
    case 'group':
      approveAccess().then(resolved, nonAuthorized);
      break;
    case 'subgroup':
      approveAccess().then(resolved, nonAuthorized);
      break;
    case 'connector':
      approveAccess().then(resolved, nonAuthorized);
      break;
    case 'organisation':
      approveAccess().then(resolved, nonAuthorized);
      break;
    default:
      approveAccess().then(resolved, nonAuthorized);
      break;
    }

    return deferred.promise;
  }

  /**
   * Internal generic access control function to verify access to parties.
   * This function works on a provided resource data object that makes abstraction of the
   * fact the the initiation was direct of via a batch call.
   * @param request
   * @param response
   * @param database
   * @param me
   * @param resource The resouce contains
   *      {
   *        key: "The UUID of the party",
   *        permalink: "The resource reference of the party",
   *        type: "The type of party"
   *      }
     */
  function validateCreateUpdateAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var q, qadmin;
    var resolved = function () {deferred.resolve(true);};
    var nonAuthorized = function () {deferred.reject('Non Authorized!');};
    var loggedInUser = me;
    if (loggedInUser.permalink) {
      loggedInUser.key = common.uuidFromPermalink(loggedInUser.permalink);
    }
    //check if you are updating yourself?
    if (isModifySelf(loggedInUser, resource)) {
      if (request.body.adminrole && !common.isSuperUser(me)) {
        deferred.reject('Non Authorized manipulation of admin rights!');
      } else {
        deferred.resolve(true);
      }
    }else {
      //resource exists?
      q = $u.prepareSQL('check-party-exists');
      q.sql('select count("key") from parties where key= ')
          .param(resource.key);
      cl(q);
      $u.executeSQL(database, q).then(function (result) {
        cl(result.rows);
        //handle resource update
        if (result.rows.pop().count > 0) {
          //update
          cl('triggering update of: ' + resource);
          hasUpdateAccessOnResource(request, response, database, loggedInUser, resource).then(resolved, nonAuthorized);
        } else /*Resource Creation*/{
          cl('triggering create of: ' + resource);
          hasCreateAccessOnResource(request, response, database, loggedInUser, resource).then(resolved, nonAuthorized);
        }
      });
    }
    return deferred.promise;
  }

  function checkCreateUpdateAccessOnResource(request, response, database, me, batch) {
    var resource = {};
    if (batch) {
      resource.key = common.uuidFromPermalink(batch.href);
      resource.permalink = batch.href;
      resource.type = batch.body.type;
    } else {
      resource.key = request.params.key;
      resource.permalink = request.url;
      resource.type = request.body.type;
    }
    cl(resource.key + ';' + resource.permalink + ';' + resource.type);
    return validateCreateUpdateAccessOnResource(request, response, database, me, resource);
  }

  function checkDeleteAccessOnResource(request, response, database, me, batch) {
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    loggedInUser.key = common.uuidFromPermalink(me.permalink);
    // check if you are updating yourself?
    if (me && (loggedInUser.permalink === ret.type + '/' + request.params.key)) { //updating myself
      deferred.resolve(true);
    }else {
      q = $u.prepareSQL('fetch-party');
      q.sql('select * from parties where key=').param(request.params.key);
      cl(q);
      $u.executeSQL(database, q).then(function (result) {
        cl(result.rows);
        if (result.rows.length > 0) {
          if (result.rows[0].type === 'person') {
            deferred.reject('Delete not allowed!');
          } else {
            deferred.resolve(true);
          }
        } else {
          deferred.resolve(true);
        }
      });

    }
    return deferred.promise;
  }

  /* TODO: migrate common access controll calls to a common security mechanism */

  function checkAccessOnResource(request, response, database, me, batch) {
    var deferred = Q.defer();
    switch (request.method) {
    case 'GET':
      return checkReadAccessOnResource(request, response, database, me, batch);
    case 'PUT':
      return checkCreateUpdateAccessOnResource(request, response, database, me, batch);
    case 'DELETE':
      return checkDeleteAccessOnResource(request, response, database, me, batch);
    default:
      deferred.reject('Unauthorized Method used!');
      return deferred.promise.then(function(){cl('Access Allowed')}, function(){cl('Access Denied')});;
    }
  }

  function conditionLogin(key, e) {
    if (!e[key] || e.type !== 'person') {
      $m.remove(key, e);
    }
  }

  function conditionPassword(key, e) {
    var salt;
    if (e[key] && e.type === 'person') {
      salt = bcrypt.genSaltSync(10);
      e[key] = bcrypt.hashSync(e[key], salt);
    } else {
      $m.remove(key, e);
    }
  }

  var ret = {
    // Base url, maps 1:1 with a table in postgres
    // Same name, except the '/' is removed
    type: '/parties',
    // Is this resource public ?
    // Can it be read / updated / inserted publicly ?
    public: false,
    // Multiple function that check access control
    // They receive a database object and
    // the security context of the current user.
    secure: [
      checkAccessOnResource
      //checkSomeMoreRules
    ],
    // Standard JSON Schema definition.
    // It uses utility functions, for compactness.
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A person, organisations, subgroup, group, connector group, etc... ' +
        'participating in a mutual credit system, time bank or knowledge bank.',
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'The type of party this resource describes.',
          enum: ['person', 'organisation', 'subgroup', 'group', 'connector']
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
          'Password for accessing the API. Only people have a password. ' +
          'Can only be PUT, and is never returned on GET.',
          3),
        secondsperunit: $s.numeric(
          'If the party is a group that operates a time bank (i.e. agreements with ' +
          'the members exist about using time as currency), then this value expresses the number units per second.'
        ),
        currencyname: $s.string('The name of the currency, as used by a mutual credit group'),
        status: {
          type: 'string',
          description: 'The status of this party.',
          enum: ['active', 'inactive']
        },
        adminrole: {
          type: 'string',
          description: 'The system security level assigned to this party',
          enum: ['all', 'none']
        }
      },
      required: ['type', 'name', 'status']
    },
    // Functions that validate the incoming resource
    // when a PUT operation is executed.
    validate: [
      //validateAuthorVersusThemes
      validateUnicity
    ],
    // Supported URL parameters are configured
    // this allows filtering on the list resource.
    query: {
      ancestorsOfParties: ancestorsOfParties,
      reachableFromParties: reachableFromParties,
      descendantsOfParties: descendantsOfParties,
      forMessages: common.filterRelatedManyToMany($u, 'messageparties', 'party', 'message'),
      inLatLong: inLatLong,
      defaultFilter: $q.defaultFilter
    },
    queryDocs: {
      ancestorsOfParties: 'Only retrieve parties that are direct, or indirect parent ' +
        '(via an "is member of" relation) of given parties.',
      reachableFromParties: 'Only retrieve parties that are reachable from a (comma-separated) ' +
        'list of parties. By reachable we mean parties that are found by first finding all ' +
        '(direct or indirect) parents (via an "is member of" relation) of a list of parties. ' +
        'And then by finding, from those top level parents, all (direct or indirect) children.',
      descendantsOfParties: 'Only retrieve direct and indirect members of the given parties.',
      forMessages: 'Only retrieve parties where the given messages were posted.',
      inLatLong: 'Retrieve parties in a geographic box. The box must be expressed in terms of a ' +
        'minimum and maximum latitude and longitude. The boundaries MUST be expressed as degrees with ' +
        'exactly one decimal digit. ' +
        'They must be specified in the format minLat,maxLat,minLong,maxLong (comma separated).' +
        '<p>Example : <code><a href="/parties?inLatLong=50.9,51.0,4.1,4.2">' +
        'GET /parties?inLatLong=50.9,51.0,4.1,4.2</a></code></p>'
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
        onread: $m.removeifnull,
        oninsert: conditionLogin,
        onwrite: conditionLogin
      },
      password: {
        onread: $m.remove,
        oninsert: conditionPassword,
        onwrite: conditionPassword
      },
      secondsperunit: {
        onread: $m.removeifnull
      },
      currencyname: {
        onread: $m.removeifnull
      },
      status: {},
      adminrole: {}
    },
    // After update, insert or delete
    // you can perform extra actions.
    afterread: [
      addLinks, addDirectParent
    ],
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
