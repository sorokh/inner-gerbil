var Q = require('q');
var common = require('./common.js');
var security = require('./commonSecurity.js');
var cl = common.cl;

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $q = sri4node.queryUtils;

  function isOwnMessageRelation(database, me, resource) {
    var messageRelationId = resource.key;
    var partyId = me.key;
    var deferred = Q.defer();
    var q;
    q = $u.prepareSQL('isOwnMessageRelation');
    q.sql('select * from messagerelations mr, messages m where mr.key = ').param(messageRelationId);
    q.sql(' and mr.from = m.key and  m.author=').param(partyId);
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
  
  
  function isAccessibleMessage(database, me, messageRelation,filterprivate) {
    'use strict';
    var filter = filterprivate || false;
    var messageRelationId = messageRelation.key;
    var deferred = Q.defer();
    var q;
    var virtualtablename = 'messagedParties';
    var nonrecursive = $u.prepareSQL(),
        recursive = $u.prepareSQL(),
        recursive2 = $u.prepareSQL(),
        nonrecursive2 = $u.prepareSQL();
    
    q = $u.prepareSQL('isAccessibleMessageForRelation');    
    if (filter){
      nonrecursive.sql('SELECT mp."party" FROM messageparties mp, messagerelations mr, messages m where mp.message = mr.to and m.key = mr.from and mr.type = "response_private" and mr.key =');
      nonrecursive.param(messageRelationId);
      nonrecursive.sql(' and m.author=');
      nonrecursive.param(me.key);
      recursive.sql('SELECT r."from" FROM partyrelations r, messagedPartiesPrivate c ' +
                    'where r."to" = c.key and r.type = \'member\' and r.status=\'active\' ');
      q.with(nonrecursive, 'UNION', recursive, 'messagedPartiesPrivate(key)');
      nonrecursive2.sql('SELECT mp."party" FROM messageparties mp, messagerelations mr, messages m where mp.message = mr.to and m.key = mr.from and mr.type <> "response_private" and mr.key =');
      nonrecursive2.param(messageRelationId);
      recursive2.sql('SELECT r."from" FROM partyrelations r, messagedPartiesPublic c ' +
                    'where r."to" = c.key and r.type = \'member\' and r.status=\'active\' ');
      q.with(nonrecursive2, 'UNION', recursive2, 'messagedPartiesPublic(key)');
      q.sql('SELECT key FROM messagedPartiesPrivate');
      q.sql(' where key = ').param(me.key);
      q.sql('UNION SELECT key from messagedPartiesPublic');
      q.sql(' where key = ').param(me.key);
    } else {
      nonrecursive.sql('SELECT mp."party" FROM messageparties mp, messagerelations mr where mp.message = mr.to and mr.key =');
      nonrecursive.param(messageRelationId);
      recursive.sql('SELECT r."from" FROM partyrelations r, messagedParties c ' +
                    'where r."to" = c.key and r.type = \'member\' and r.status=\'active\' ');
      q.with(nonrecursive, 'UNION', recursive, 'messagedParties(key)');
      
      q.sql('SELECT key FROM messagedParties');
      q.sql(' where key = ').param(me.key);
    }
    cl(q);
    $u.executeSQL(database, q).then(function (result) {
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

  function isLinkableMessage(me, messageId, targetMessageId, database) {
    var deferred = Q.defer();
    var q;
    var partyId = me.key;
    /*
    check if relation is already available and if it is linked to self!
    */
   
    q = $u.prepareSQL('isOwnMessage4Relation');
    q.sql('select * from messages m where m.key = ').param(messageId);
    q.sql(' and  m.author=').param(partyId);
    cl(q);
    $u.executeSQL(database, q).then(function (result) {
      cl(result.rows);
      if (result.rows.length > 0) {
        var nonrecursive = $u.prepareSQL(),
            recursive = $u.prepareSQL(),
            recursive2 = $u.prepareSQL(),
            nonrecursive2 = $u.prepareSQL();
        q = $u.prepareSQL('isAccessibleMessageForRelation'); 
        nonrecursive.sql('SELECT mp."party" FROM messageparties mp, messagerelations mr where mp.message =');
        nonrecursive.param(targetMessageId);
        recursive.sql('SELECT r."from" FROM partyrelations r, messagedParties c ' +
                      'where r."to" = c.key and r.type = \'member\' and r.status=\'active\' ');
        q.with(nonrecursive, 'UNION', recursive, 'messagedParties(key)');
        
        q.sql('SELECT key FROM messagedParties');
        q.sql(' where key = ').param(me.key);
        cl(q);
        $u.executeSQL(database, q).then(function (result) {
          cl(result.rows);
          if (result.rowCount > 0) {
            deferred.resolve(true);
          } else {
            deferred.resolve(false);
          }
        }).catch(function (e) {
          deferred.resolve(false);
        });
      } else {
        deferred.resolve(false);
      }
      });
    return deferred.promise;
  }

  function checkCreateAccessOnResource(request, response, database, me, resource) {
    /**
    I can create a relation from a message of my own to a message to which I have access.
    Unless an active relation already exists. 
    As a superadmin I'm allowed to create a relation between any message.
    */
    var deferred = Q.defer();
    var sourceId = common.uuidFromPermalink(request.body.from.href);
    var targetId = common.uuidFromPermalink(request.body.to.href);
    
    isLinkableMessage(me,sourceId, targetId ,database).then(function (isLinkable) {
      
      if (isLinkable) {
          deferred.resolve(true);
      } else {
         deferred.reject('Message not Linkeable!');
      };
    }).catch(function (e) {
      cl(e);
       deferred.reject('Not linking with self not allowed!');
    });
    return deferred.promise;
  }
  
  function checkReadAccessOnResource(request, response, database, me, resource) {
      var deferred = Q.defer();
      
      if (resource.key){
        isOwnMessageRelation(database,me,resource).then(function(isOwn){
          if(isOwn){
            //You should be able to read you own relations
            deferred.resolve(true);
          } else {
            //If its not your own relation you should only be able to read public replies to messages that you have access to.
            isAccessibleMessage(database, me, resource).then(function(isAccessible){
            if(isAccessible){
                deferred.resolve(true);
            } else {
              deferred.reject('Read is not allowed!');
            }
          });
          }
        });
      } else {
          //list resource!
          deferred.resolve(true);
      }
      return deferred.promise;
  }

  function checkAccessOnResource(request, response, database, me, batch) {
    return security.checkAccessOnResource($u, request, response, database, me, batch,
      {
        read: checkReadAccessOnResource,
        create: checkCreateAccessOnResource,
        isOwn: isOwnMessageRelation,
        table: 'messagerelations'
      });
  }
  
  function filterAccessible() {
    /*
    Unless you are a superadmin
    you should only have access to your own messagerelations
    or public responses to messages that are accessible to you
    */
    return function (database, elements, me) {
      var deferred = Q.defer();
      var nonrecursive, recursive, select;
      var messageRelations = elements || [];
      var keys = [];
      var keyToElement = {};
      messageRelations.forEach(
        function (e) {
            keys.push(common.uuidFromPermalink(e.$$meta.permalink));
            keyToElement[common.uuidFromPermalink(e.$$meta.permalink)] = { element: e, keep: false};
        }
      );
      cl(messageRelations);
      if (common.isSuperUser(me)) {
        deferred.resolve(messageRelations);
      } else {
        /* select the messages for which I'm not the author and for
        which I don't have the publishedToParty in my reacheable party graph and remove them*/
    
        select = $u.prepareSQL();
        nonrecursive = $u.prepareSQL();
    
        nonrecursive.sql('SELECT mr.key as key, mp."party" as target FROM messageparties mp, messagerelations mr where mp.message = mr.to and mr.key in(');
        nonrecursive.array(keys).sql(')');
        
        recursive = $u.prepareSQL();
        recursive.sql('select s.key, r."from" from partyrelations r, accesibleparties s '+
                      'where r."to" = s.target and r.type = \'member\' and r.status = \'active\' ');
                      
        select.with(nonrecursive, 'UNION', recursive, 'accesibleparties(key, target)');

        select.sql('select distinct ac.key from accesibleparties ac where ac.target =').param(me.key)
        
        cl(keys);
        cl(select);
        $u.executeSQL(database, select).then(function (result) {
          cl(result.rows);
          cl(keyToElement);
          if(result.rowCount >0){
          result.rows.forEach(
              function (row) {
               keyToElement[row.key].keep = true;
              });
          }
          elements = elements.filter(
            function (element) {
                if(!keyToElement[common.uuidFromPermalink(element.$$meta.permalink)].keep){
                    for (var prop in element) { if (element.hasOwnProperty(prop)) { delete element[prop]; } }
                    return false;
                
                }
              return true;
            }
          );
          cl(elements);
          deferred.resolve(elements);
        }).catch(function (e) {
          cl(e);
          deferred.reject(false);
        });
      }
      return deferred.promise;
    };
  }

  var ret = {
    type: '/messagerelations',
    public: false,
    secure: [
      checkAccessOnResource
    ],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A relationship between two messages. A message can be a response to another message,' +
        ' this response can be public (visible in the group), or private, etc...',
      type: 'object',
      properties: {
        key: {},
        from: {
          references: '/messages'
        },
        to: {
          references: '/messages'
        },
        type: {
          type: 'string',
          description: 'The type of relationship. Currently messages can be private or public responses to a ' +
            'top level message. For now reponses can not be given to other responses. This may be extended in the ' +
            'future.',
          enum: ['response_private', 'response_public']
        }
      },
      required: ['from', 'to', 'type']
    },
    validate: [],
    query: {
      to: $q.filterReferencedType('/messages', 'to'),
      defaultFilter: $q.defaultFilter
    },
    queryDocs: {
      to: 'Returns all responses to a (comma separated) list of messages.'
    },
    map: {
      from: {
        references: '/messages'
      },
      to: {
        references: '/messages'
      },
      type: {}
    },
    afterread: [
        filterAccessible()
    ],
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
