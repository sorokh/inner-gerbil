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

  function validateUnicity(value, database) {
    var q;
    var deferred = Q.defer();
    if(value.login) {
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
    return deferred.promise;
  }

  function checkReadAccessOnResource(request, response, database, me, batch) {
    var deferred = Q.defer();
    return deferred.resolve();
  }

  function checkCreateUpdateAccessOnResource(request, response, database, me, batch) {
    var deferred = Q.defer();
    var q, qadmin;
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    // check if you are updating yourself?
    if (me && (loggedInUser.permalink === '/parties/' + request.params.key)) { //updating myself
      deferred.resolve(true);
    }else {
      // check if key exists to determine if its an update or not.
      q = $u.prepareSQL('check-party-exists');
      q.sql('select count("key") from parties where key= ')
          .param(request.params.key);
      cl(q);
      $u.executeSQL(database, q).then(function (result) {
        cl(result.rows);
        if (result.rows.pop().count > 0) {
          //update
          switch (request.body.type) {
            case 'person':
              if (request.url === me.permalink) {
                deferred.resolve(true);
              } else {
                deferred.reject('Only owner is allowed to update his records!');
              }
              break;
            case 'group':
                //Only person who has admin role
                qadmin = $u.prepareSQL('check-is-admin');
                qadmin.sql('select from partyrelations where from=').param(loggedInUser.key)
                    .sql('and to=').param(request.params.key)
                    .sql('and type="admin"');
                cl(qadmin);
                $u.executeSQL(database,qadmin).then(function (result2){
                  cl(result2.rows);
                  if(result2.rows.count > 0){
                    //has admin role on group.
                    deferred.resolve(true);
                  } else {
                    deferred.reject('Only a group admin may update a group!');
                  }
                });
                  break;
            case 'subgroup':
              //Only person who has admin role on subgroup or parent group(s)
                qadmin = $u.prepareSQL('check-is-admin-of-subgroup');
                qadmin.sql('select from partyrelations where from=').param(loggedInUser.key)
                    .sql('and type="admin"');
                common.ancestorsOfParties($u, request.params.key, qadmin, 'ancestorsOfParties');
                qadmin.sql('and to in (SELECT key FROM ancestorsOfParties)');
                cl(qadmin);
                $u.executeSQL(database, qadmin).then(function (result2) {
                  cl(result2.rows);
                  if(result2.rows.count > 0){
                    //had eligeable admin role
                    deferred.resolve(true);
                  } else {
                    deferred.reject('Only a group admin mya update a subgroup!');
                  }
                });
                  break;
            case 'connector':
                  break;
            case 'organisation':
                  break;
            default:
                deferred.reject('Unsupported party type access.');
              break;
          }
        } else {
          //create
          switch (request.body.type) {
            case 'person':
              deferred.resolve(true);
              break;
            case 'group':
              deferred.resolve(true);
              break;
            case 'subgroup':
              deferred.resolve(true);
              break;
            case 'connector':
              deferred.resolve(true);
              break;
            case 'organisation':
              deferred.resolve(true);
              break;
            default:
              deferred.reject('only person can be created');
              break;
          }
        }
      });
      return deferred.promise;
    }
    //Must be admin or me to update a party.
      // A person can always be created -> open subscription?
      // A group can always be created, but must be logged in
      // A subgroup can only be created if you have an admin relation. In the party relation there will be a check
      // on the proper admin group, transactional integrity to be guaranteed outside core?
    //return deferred.promise;
  }

  function checkDeleteAccessOnResource(request, response, database, me, batch) {
    var deferred = Q.defer();
    return deferred.resolve();
  }

  function checkAccessOnResource(request, response, database, me, batch) {
    var deferred = Q.defer();
    //evaluate request

    switch (request.method) {
        case 'GET':
            return checkReadAccessOnResource(request,response,database,me,batch);
        case 'PUT':
            return checkCreateUpdateAccessOnResource(request,response,database,me,batch);
        case 'DELETE':
            return checkDeleteAccessOnResource(request,response,database,me,batch);
        default:
            deferred.reject('Unauthorized Method used!');
            return deferred.promise;
    }

  }

  function conditionLogin(key,e){
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
      title: 'A person, organisations, subgroup, group, connectorgroup, etc... ' +
        'participating in a mutual credit / knowledge exchange system.',
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
          enum: ['active', 'inactive']
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
    beforequery: [
      //validateUnicity
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
    querydocs: {
      ancestorsOfParties: 'Only retrieve parties that are direct, or indirect parent of given parties.',
      reachableFromParties: 'Only retrieve parties that are reachable. ' +
        '(by find all children of the given parties their parents)',
      descendantsOfParties: 'Only retrieve direct and indirect members of the given parties.',
      forMessages: 'Only retrieve parties where the given messages were posted.'
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
      status: {}
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
