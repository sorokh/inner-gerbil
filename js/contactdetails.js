var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var parties = require('./parties.js');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

    /**
     * GET: Should allow reading of public contact info
     * Non public contact info is  readible for group members?
     * Filtering of result set can be done with after read!
     */

  function forDescendantsOfParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    common.descendantsOfParties($u, value, select, 'descendantsOfParties');
    select.sql(' and key in ' +
               '(select contactdetail from partycontactdetails where party in ' +
               '(select key from descendantsOfParties where key not in (').array(keys).sql('))) ');
  }

  function forPartiesReachableFromParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    common.reachableFromParties($u, value, select, 'partiesReachableFromParties');
    select.sql(' and key in ' +
               '(select contactdetail from partycontactdetails where party in ' +
               '(select key from partiesReachableFromParties where key not in (').array(keys).sql('))) ');
  }

  function forAncestorsOfParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    common.ancestorsOfParties($u, value, select, 'ancestorsOfParties');
    select.sql(' and key in ' +
               '(select contactdetail from partycontactdetails where party in ' +
               '(select key from ancestorsOfParties where key not in (').array(keys).sql('))) ');
  }

  function forParentsOfParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    select.sql(' and "key" in ' +
               '(select "contactdetail" from partycontactdetails where "party" in ' +
               '(select "to" from partyrelations where "from" in (').array(keys).sql(') and "type" = \'member\')) ');
  }

  function forChildrenOfParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    select.sql(' and "key" in ' +
               '(select "contactdetail" from partycontactdetails where "party" in ' +
               '(select "from" from partyrelations where "to" in (').array(keys).sql(') and "type" = \'member\')) ');
  }

  function isOwnContactDetail(partyId, contactdetailId, database) {
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnContactDetail');
    q.sql('select * from parties p, partycontactdetails pc, contactdetails c where c.key = ').param(contactdetailId);
    q.sql(' and p.key=').param(partyId);
    q.sql(' and pc.party = p.key and pc.contactdetail = c.key');
    cl(q);
    $u.executeSQL(database, q).then(function (result) {
      cl(result.rows);
      if (result.rows.length > 0) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    }).catch(function (e) {
      cl(e);
      deferred.resolve(false);
    });
    return deferred.promise;
  }

  /**
   * Security Section
   **/
  function checkReadAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    var contactdetailId = resource.key;
    if (!contactdetailId) {
      //List is requested so we rely on the filtering after read.
      deferred.resolve(true);
    } else {
      loggedInUser.key = me.permalink.split('/')[2];
      //You are allowed to read contact details if they are your contactdetails or if they
      //have been defined as public
      isOwnContactDetail(loggedInUser.key, contactdetailId, database).then(function (isOwn) {
        if (isOwn) {
          deferred.resolve(true);
        } else {
          q = $u.prepareSQL('isPublicContactDetail');
          q.sql('select * from contactdetails c where c.key = ').param(contactdetailId);
          q.sql(' and c.public=').param(true);
          cl(q);
          $u.executeSQL(database, q).then(function (result) {
            cl(result.rows);
            if (result.rows.length > 0) {
              deferred.resolve(true);
            } else {
              deferred.resolve(false);
            }
          }).catch(function (e) {
            cl(e);
            deferred.resolve(false);
          });
        }
      });
    }
    return deferred.promise;
  }

  function checkExists(database, me, resource) {
    /*global Q*/
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    /* check if this is an update of a create */
    q = $u.prepareSQL('check-contactdetail-exists');
    q.sql('select count("key") from contactdetails where key= ')
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
    return deferred.promise;
  }


  function checkUpdateAccessOnResource(request, response, database, me, resource) {
    /*global Q*/
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    isOwnContactDetail(loggedInUser.key, resource.key, database).then(function (isOwn) {
      if (isOwn) {
        deferred.resolve(true);
      } else {
        deferred.reject('Update is not allowed!');
      }
    });
    return deferred.promise;
  }

  function checkDeleteAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    loggedInUser.key = me.permalink.split('/')[2];
    //You are allowed to update contact details if they are you contactdetails or if you are a superadmin?
    // First you need to fetch the contactdetails for me.
    isOwnContactDetail(loggedInUser.key, resource.key, database).then(function (isOwn) {
      if (isOwn) {
        deferred.resolve(true);
      } else {
        deferred.reject('Delete is not allowed!');
      }
    });
    return deferred.promise;
  }


  function checkAccessOnResource(request, response, database, me, batch) {
    return security.checkAccessOnResource($u, request, response, database, me, batch,
      {
        read: checkReadAccessOnResource,
        update: checkUpdateAccessOnResource,
        delete: checkDeleteAccessOnResource,
        table: 'contactdetails'
      });
  }

  function filterAccessible() {
    /*
    Unless you are a superadmin or member of the same group
    you should only have access to public contactdetails.
    */
    return function (database, elements, me) {
      var contactRefs = [];
      var deferred = Q.defer();
      var nonrecursive, recursive, select;
      var contactDetails = elements || [];
      var keys = [];
      var keyToElement = {};
      contactDetails.forEach(function (e) {
        keys.push(e.key);
        keyToElement[e.key] = e;
      });
      if (common.isSuperUser(me)) {
        deferred.resolve(contactDetails);
      } else {
        /* select the contact for which I'm not the owner and are not public and union with
        select the owners for those that are public and for which I'm not the owner and for
        which I don't have the owners in my reacheable party graph and remove them*/
        contactRefs = [];
        contactDetails.forEach(
          function (contact) {
            contactRefs.push(common.uuidFromPermalink(contact.permalink));
          });
        select = $u.prepareSQL();
        nonrecursive = $u.prepareSQL();

        nonrecursive.sql('select distinct c.key as key,p.key as owner from contactdetails c, ' +
        'partycontactdetails pc, parties p where c.public = true and ' +
        'pc.contactdetail=c.key and pc.party <>').param(me.key)
        .sql('and c.key in (').array(keys).sql(')');

        recursive = $u.prepareSQL();
        recursive.sql('select s.key,r.to FROM partyrelations r, accesibleparties s ' +
        'where r."from" = s.party and r.type = \'member\' and r.status=\'active\'');

        select.with(nonrecursive, 'UNION', recursive, 'accesibleparties(key,party)');

        select.sql('select distinct ac.key from accesibleparties ac')
        .sql(' UNION ')
        .sql('select distinct c.key from contactdetails c, partycontactdetails pc ' +
        'where c.public = false and pc.contactdetail = c.key and pc.party <> ').param(me.key);

        cl(select);
        $u.executeSQL(database, select).then(function (result) {
          cl(result.rows);
          result.forEach(
              function (row) {
                delete keyToElement[row.key];
              });
          elements = elements.filter(
            function (element) {
              var value;
              if (keyToElement[element.key]) {
                value = true;
              } else {
                value = false;
              }
              return value;
            }
          );
          deferred.resolve(elements);
        }).catch(function (e) {
          cl(e);
          deferred.resolve(false);
        });
      }
      return deferred.promise;
    };
  }

  var ret = {
    type: '/contactdetails',
    public: false,
    secure: [
      checkAccessOnResource
    ],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A contact detail of one of the parties involves in a mutual credit system, time bank ' +
        ' or knowledge bank. It can be an address, e-mail, website, facebook page, etc.. etc..' +
        ' A contact detail can be marked public, which renders it visible inside of the current ' +
        '<em>group</em> (or any of it\'s subgroups). Contactdetails are never exposed outside of ' +
        'the group(s) to which a party belongs. A mechanism to contact a person in a different group ' +
        'is available, without exposing details such as email, address, etc.. ' +
        'This is achieved by posting a (private) reply to a message in a different group. ' +
        '(This is possible only when said message was published to a connector group - making ' +
        'it visible to parties outside of the group(s) where the author is a member.)',
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'The type of contactdetail.',
          enum: ['address', 'email', 'facebook', 'website']
        },
        label: $s.string('A display label for this contact detail.'),

        /* Generic value of the contact detail */
        value: $s.string('Value for a contact detail such as an email, website, facebook page. ' +
          'Addresses use different fields.'),

        /* Address fields */
        street: $s.string('Streetname of an address.'),
        streetnumber: $s.string('Street number of an address.'),
        streetbus: $s.string('Postal box of an address.'),
        zipcode: $s.belgianzipcode('4 digit postal code of the city for an address.'),
        city: $s.string('City for an address.'),
        latitude: $s.numeric('Latitude of an address.'),
        longitude: $s.numeric('Longitude of an address.'),

        'public': // eslint-disable-line
          $s.boolean('Is this contact detail visible to other members of your group (and all it\'s subgroups ?')
      },
      required: ['type', 'public']
    },
    map: {
      key: {},
      type: {},
      label: {
        onread: $m.removeifnull
      },
      value: {
        onread: $m.removeifnull
      },

      street: {
        onread: $m.removeifnull
      },
      streetnumber: {
        onread: $m.removeifnull
      },
      streetbus: {
        onread: $m.removeifnull
      },
      zipcode: {
        onread: $m.removeifnull
      },
      city: {
        onread: $m.removeifnull
      },
      latitude: {
        onread: $m.removeifnull
      },
      longitude: {
        onread: $m.removeifnull
      },

      'public': {} // eslint-disable-line
    },
    validate: [],
    query: {
      forPartiesReachableFromParties: forPartiesReachableFromParties,
      forDescendantsOfParties: forDescendantsOfParties,
      forAncestorsOfParties: forAncestorsOfParties,
      forParentsOfParties: forParentsOfParties,
      forChildrenOfParties: forChildrenOfParties,
      forParties: common.filterRelatedManyToMany($u, 'partycontactdetails', 'contactdetail', 'party'),
      forMessages: common.filterRelatedManyToMany($u, 'messagecontactdetails', 'contactdetail', 'message'),
      defaultFilter: $q.defaultFilter
    },
    queryDocs: {
      forPartiesReachableFromParties: 'Returns contact details that belong to parties that are reachable ' +
        '(potentially via a parent group / subgroup) from a given (comma separated) list of parties. ' +
        'The term "reachable" means the graph of parties will be scanned to all top parents of the ' +
        'given list of parties, and then recursed down to include all parties that are a member ' +
        '(directly or indirectly) of those parent.',
      forDescendantsOfParties: 'Returns contact details that belong to  ' +
        'direct or indirect members of a given (comma separated) list of parties.',
      forAncestorsOfParties: 'Returns contact details that belong to ancestors ' +
        '(direct or indirect parents via an "is member of" relation) of a given ' +
        '(comma separated) list of parties.',
      forParentsOfParties: 'Returns contact details that belong to direct parents ' +
        '(via an "is member of" relation) of a (comma separated) list of parties.',
      forChildrenOfParties: 'Returns contact details that belong to direct members ' +
        'of a (comma separated) list of parties.',
      forParties: 'Returns contact details for a given (comma separated) list of parties.',
      forMessages: 'Returns contact details associated to a (comma separated) list of messages.'
    },
    afterread: [
      filterAccessible(),
      common.addRelatedManyToMany($u, 'partycontactdetails', 'contactdetail', 'party', '/parties', '$$parties'),
      common.addRelatedManyToMany($u, 'messagecontactdetails', 'contactdetail', 'message', '/messages', '$$messages')
    ],
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
