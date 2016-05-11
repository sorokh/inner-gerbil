var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  function postedInAncestorsOfParties(value, select) {
    common.ancestorsOfParties($u, value, select, 'partiesAncestorsOfParties');
    select.sql(' and "key" in (select "message" from messageparties where "party" in ' +
               '(select "key" from partiesAncestorsOfParties)) ');
  }

  function postedInDescendantsOfParties(value, select) {
    common.descendantsOfParties($u, value, select, 'partiesDescendantsOfParties');
    select.sql(' and "key" in (select "message" from messageparties where "party" in ' +
               '(select "key" from partiesDescendantsOfParties)) ');
  }

  function postedInPartiesReachableFromParties(value, select) {
    common.reachableFromParties($u, value, select, 'partiesReachableFromParties');
    select.sql(' and "key" in (select "message" from messageparties where "party" in ' +
               '(select "key" from partiesReachableFromParties)) ');
  }

  function postedByDescendantsOfParties(value, select) {
    common.descendantsOfParties($u, value, select, 'partiesDescendantsOfParties');
    select.sql(' and author in (select key from partiesDescendantsOfParties) ');
  }

  function descendantsOfMessages(value, select) {
    common.descendantsOfMessages($u, value, select, 'messagesDescendantsOfMessages');
    select.sql(' and key in (select key from messagesDescendantsOfMessages) ');
  }

  function postedByPartiesInLatLong(value, select) {
    common.filterLatLong($u, value, select, 'parties', 'partiesforlatlongcontactdetails');
    select.sql(' and "author" in ' +
               '(select "key" from partiesforlatlongcontactdetails) ');
  }

  /**
  * Check if the referred message is under the specified users ownership.
  * This is direct ownership or ownership via group admin rights.
  **/
  function isOwnMessage(database, me, resource) {
    var messageId = resource.key;
    var partyId = me.key;
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnMessage');
    q.sql('select * from messages m where m.key = ').param(messageId);
    q.sql(' and m.author=').param(partyId);

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

  function checkReadAccessOnResource(request, response, database, me, resource) {
    var deferred = Q.defer();
    var q;
    var loggedInUser = me;
    var messageId = resource.key;
    if (!messageId) {
      //List is requested so we rely on the filtering after read.
      deferred.resolve(true);
    } else {
      //You are allowed to read contact details if they are your contactdetails or if they
      //have been defined as public
      isOwnMessage(database, loggedInUser, resource).then(function (isOwn) {
        if (isOwn) {
          deferred.resolve(true);
        } else {
          q = $u.prepareSQL('isAccessibleMessage');
          q.sql('select * from contactdetails c where c.key = ').param(messageId);
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

  function checkAccessOnResource(request, response, database, me, batch) {
    return security.checkAccessOnResource($u, request, response, database, me, batch,
      {
        read: checkReadAccessOnResource,
        isOwn: isOwnMessage,
        table: 'messages'
      });
  }

  function filterAccessible() {
    /*
    Unless you are a superadmin or member of the same group
    you should only have access to public contactdetails.
    */
    return function (database, elements, me) {
      var messageRefs = [];
      var deferred = Q.defer();
      var nonrecursive, recursive, select;
      var messages = elements || [];
      var keys = [];
      var keyToElement = {};
      messages.forEach(function (e) {
        keys.push(e.key);
        keyToElement[e.key] = e;
      });
      if (common.isSuperUser(me)) {
        deferred.resolve(messages);
      } else {
        /* select the messages for which I'm not the author and for
        which I don't have the publishedToParty in my reacheable party graph and remove them*/
        messageRefs = [];
        messages.forEach(
          function (message) {
            messageRefs.push(message.key);
          });
        select = $u.prepareSQL();
        nonrecursive = $u.prepareSQL();
        nonrecursive.sql('select distinct m.key as key, m.author as owner from messages m, ' +
        'parties p, messageparties mp'
        );
//TODO: create correct filtering statement
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
    type: '/messages',
    public: false,
    secure: [
      checkAccessOnResource
    ],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A message posted by a person/organisation.',
      type: 'object',
      properties: {
        author: $s.permalink('/parties', 'The person/organisation that posted this message.'),
        title: $s.string('Title of the message'),
        description: $s.string('Message body, in semantic HTML.'),
        eventdate: $s.timestamp('If the message has tag "evenement", it must supply an event date/time here.'),
        amount: $s.numeric('The amount of currency requested/offered for a certain activity.'),
        unit: $s.string('The unit the currency amount applies to. Like : per hour, per item, per person, etc..'),
        tags: {
          type: 'array',
          items: {
            type: 'string'
          },
          minItems: 0,
          uniqueItems: true
        },
        photos: {
          type: 'array',
          items: {
            type: 'string'
          },
          minItems: 0,
          uniqueItems: false
        },
        created: $s.timestamp('When was the message created ?'),
        modified: $s.timestamp('When was the message last modified ?'),
        expires: $s.timestamp('When should the message be removed ?')
      },
      required: ['author', 'description', 'tags', 'photos', 'created', 'modified']
    },
    map: {
      key: {},
      author: {
        references: '/parties'
      },
      title: {
        onread: $m.removeifnull
      },
      description: {},
      eventdate: {
        onread: $m.removeifnull
      },
      amount: {
        onread: $m.removeifnull
      },
      unit: {
        onread: $m.removeifnull
      },
      tags: {},
      photos: {
        onread: $m.removeifnull
      },
      created: {},
      modified: {},
      expires: {
        onread: $m.removeifnull
      }
    },
    validate: [],
    query: {
      postedInParties: common.filterRelatedManyToMany($u, 'messageparties', 'message', 'party'),
      postedInAncestorsOfParties: postedInAncestorsOfParties,
      postedInDescendantsOfParties: postedInDescendantsOfParties,
      postedInPartiesReachableFromParties: postedInPartiesReachableFromParties,

      postedByParties: $q.filterReferencedType('/parties', 'author'),
      postedByDescendantsOfParties: postedByDescendantsOfParties,

      postedByPartiesInLatLong: postedByPartiesInLatLong,

      descendantsOfMessages: descendantsOfMessages,
      defaultFilter: $q.defaultFilter
    },
    afterread: [
      common.addRelatedManyToMany($u, 'messagetransactions', 'message', 'transaction',
                                  '/transactions', '$$transactions'),
      common.addRelatedManyToMany($u, 'messageparties', 'message', 'party',
                                  '/parties', '$$postedInParties'),
      common.addRelatedManyToMany($u, 'messagecontactdetails', 'message', 'contactdetail',
                                  '/contactdetails', '$$contactdetails')
      //common.addRelatedManyToMany($u, 'messagerelations', 'to','from', '/messages', '$$reactions')
    ],
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
