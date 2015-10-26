/*eslint-env node*/
var common = require('../test/common.js');
var Q = require('q');
var deferred = Q.defer();

var port = 5000;
var base = 'http://localhost:' + port;

var sriclient = require('sri4node-client');
var doPut = sriclient.put;

exports = module.exports = function (fileName) {
  'use strict';
  var importUser = function (user) {
    var uuid = common.generateUUID();
    var party = {
      type: 'person',
      name: user.name,
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
    return doPut(base + '/parties/' + uuid, party, 'annadv', 'test').then(function (
      response) {
      if (response.statusCode !== 200) {
        console.log('PUT failed, response = ' + JSON.stringify(response));
      } else {
        console.log('PUT successful');
      }
    });
  };

  //Converter Class
  var Converter = require('csvtojson').Converter;
  var converter = new Converter({});

  //end_parsed will be emitted once parsing finished
  converter.on('end_parsed', function (jsonArray) {
    console.log(jsonArray); //here is your result jsonarray
    var promises = [];
    jsonArray.forEach(function (user) {
      console.log('User=' + JSON.stringify(user));
      console.log('Start import');
      //promises.push(importUser(user));
      promises.push(importUser(user).then(function () {
        console.log('End import');
      }));
    });
    return Q.all(promises).then(function () {
      deferred.resolve();
    });
  });

  //read from file
  console.log('Reading file: ' + fileName);
  require('fs').createReadStream(fileName).pipe(converter);
  return deferred.promise;
};
