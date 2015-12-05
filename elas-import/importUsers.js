/*eslint-env node*/
var common = require('../test/common.js');
var Q = require('q');
var deferred = Q.defer();

var port = 5000;
var base = 'http://localhost:' + port;

var sriclient = require('sri4node-client');
var doPut = sriclient.put;

exports = module.exports = function (user, partyUrl) {
  'use strict';
  var uuid = common.generateUUID();
  var party = {
    type: 'person',
    name: user.name,
    alias: user.letscode.toString(),
    status: 'inactive'
  };
  switch (user.status) {
  case 0: // inactief
    party.status = 'inactive';
    break;
  case 1: // actieve letser
    party.status = 'active';
    break;
  case 2: // uitstapper
    party.status = 'active';
    break;
  case 3: // instapper
    party.status = 'active';
    break;
  case 4: // secretariaat
    party.status = 'active';
    break;
  case 5: // infopakket
    party.status = 'inactive';
    break;
  case 6: // instap gevolgd
    party.status = 'inactive';
    break;
  case 7: // extern
    party.status = 'active';
    break;
  default:
    party.status = 'inactive';
  }
  console.log(party);
  var partyrelation = {
    from: {
      href: '/parties/' + uuid
    },
    to: {
      href: partyUrl
    },
    type: 'member',
    balance: 0,
    code: user.letscode.toString(),
    status: 'inactive'

  };
  console.log(partyrelation);
  var batchBody = [
    {
      href: '/parties/' + uuid,
      verb: 'PUT',
      body: party
          },
    {
      href: '/partyrelations/' + common.generateUUID(),
      verb: 'PUT',
      body: partyrelation
          }
    ];

  return doPut(base + '/batch', batchBody, 'annadv', 'test').then(function (
    response) {
    if (response.statusCode !== 200 && response.statusCode !== 201) {
      console.log('PUT failed, response = ' + JSON.stringify(response));
    } else {
      console.log('PUT successful');
    }
  }).catch(function (e) {
    console.log('importUser failed');
    console.log(e);
    throw e;
  });
};
