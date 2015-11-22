/*eslint-env node*/
var moment = require('moment');
var common = require('../test/common.js');
var Q = require('q');
var deferred = Q.defer();

var port = 5000;
var base = 'http://localhost:' + port;

var sriclient = require('sri4node-client');
var doGet = sriclient.get;
var doPut = sriclient.put;

exports = module.exports = function (fileName) {
  'use strict';
  var importMessage = function (msg) {
    var uuid = common.generateUUID();
    return doGet(base + '/parties?alias=' + msg.letscode, 'annadv', 'test').then(function (responseGet) {
      var message;
      var user;
      if (responseGet.statusCode !== 200) {
        console.log('GET failed, response = ' + JSON.stringify(responseGet));
      } else {
        console.log('GET successful for user with letscode ' + msg.letscode);

        if (responseGet.body.$$meta.count > 0) {
          user = responseGet.body.results[0].href;
        } else {
          console.log('No user found with letscode ' + msg.letscode + ' -> skipping import of message ' + msg.content);
        }
        message = {
          author: {
            href: user
          },
          description: msg.content,
          tags: [],
          photos: [],
          created: moment(msg.cdate),
          modified: moment(msg.cdate),
          expires: moment(msg.validity)
        };

        //console.log(message);
        return doPut(base + '/messages/' + uuid, message, 'annadv', 'test').then(function (
          responsePut) {
          if (responsePut.statusCode !== 200 && responsePut.statusCode != 201) {
            console.log('PUT failed, response = ' + JSON.stringify(responsePut));
          } else {
            console.log('PUT successful');
          }
        });
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
    jsonArray.forEach(function (message) {
      console.log('Message=' + JSON.stringify(message));
      console.log('Start import');
      promises.push(importMessage(message).then(function () {
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
