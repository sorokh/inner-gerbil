var assert = require('assert');
var async = require('async');
var sriclient = require('sri4node-client');
var doGet = sriclient.get;
var common = require('./common.js');
var cl = common.cl;
var anna = common.accounts.ANNA;
var steven = common.accounts.STEVEN;
var walter = common.accounts.WALTER;
var emmanuella = common.accounts.EMMANUELLA;
var ruud = common.accounts.RUUD;
var createHrefArray = common.createHrefArray;
var expect = require('chai').expect;


exports = module.exports = function (base, logverbose) {
  'use strict';
  
  var doGet = common.doGet(base);
  var doPut = common.doPut(base);
  var doDelete = common.doDelete(base);
  
  var entityStore = [];

  function debug(x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  describe('/transactions', function () {
    describe('GET', function () {
      it('should allow full list retrieval.', function () {
        return doGet(common.hrefs.TRANSACTIONS, ruud.login, ruud.password).then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          // TODO: add more transactions to test data
          if (response.body.$$meta.count < 2) {
            assert.fail('Expected all transactions');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        });
      });
      
      it('should allow full list retrieval as non super admin with enforced transparent filtering.', function () {
        return doGet(common.hrefs.TRANSACTIONS , steven.login, steven.password).then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          // TODO: add more transactions to test data
          if (response.body.$$meta.count < 1) {
            assert.fail('Expected at least 1 transaction');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          
          expect(response.body.results.filter(function(row){
            if(row.href==common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20 && row.$$expanded.$$meta){
              return true;
            }else{
              return false;
            }
          }).length).to.equal(0);
        });
      });

      it('should support ?involvingAncestorsOfParties=ANNA', function () {
        return doGet(common.hrefs.TRANSACTIONS + '?involvingAncestorsOfParties=' +
                     common.hrefs.PARTY_ANNA, anna.login, anna.password).then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          assert.equal(hrefs.length, 0);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        });
      });

      it('should allow parameter ?involvingDescendantsOfParties=LEBBEKE', function () {
        return doGet(common.hrefs.TRANSACTIONS  + '?involvingDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, anna.login, anna.password).then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        });
      });

      it('should allow parameter ?involvingDescendantsOfParties=DENDERMONDE', function () {
        return doGet(common.hrefs.TRANSACTIONS  + '?involvingDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSDENDERMONDE, 'annadv', 'test').then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        });
      });

      it('should allow parameter ?fromDescendantsOfParties=LEBBEKE|DENDERMONDE', function () {
        return doGet(common.hrefs.TRANSACTIONS + '?fromDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, anna.login, anna.password).then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        }).then(function () {
          return doGet(common.hrefs.TRANSACTIONS + '?fromDescendantsOfParties=' +
                       common.hrefs.PARTY_LETSDENDERMONDE, anna.login, anna.password).then(function (response) {
            debug('statusCode : ' + response.statusCode);
            debug(response.body);
            assert.equal(response.statusCode, 200);
            var hrefs = createHrefArray(response);
            expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
            expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
          });
        });
      });

      it('should allow parameter ?toDescendantsOfParties=LEBBEKE|DENDERMONDE', function () {
        return doGet(common.hrefs.TRANSACTIONS + '?toDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, anna.login, anna.password).then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        }).then(function () {
          return doGet(common.hrefs.TRANSACTIONS + '?toDescendantsOfParties=' +
                       common.hrefs.PARTY_LETSDENDERMONDE, anna.login, anna.password).then(function (response) {
            debug('statusCode : ' + response.statusCode);
            debug(response.body);
            assert.equal(response.statusCode, 200);
            var hrefs = createHrefArray(response);
            expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
            expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
          });
        });
      });
    });
    describe('PUT', function() {
      
        //Cleanup after each test.
      afterEach('cleanup test created data', function (cleanupDone) {
        async.each(entityStore, function (entity, callback) {
          doDelete(entity.permalink, entity.login, entity.password).then(
              function (response) {
                entityStore = entityStore.filter(function (e) {return e !== entity; });
                callback();
              }).done();
        }, function (res) {cleanupDone(); });
      });
        it('should be possible to add a transaction as the initiating party for an accessible party', function (done) {
          var testTransactionKey = common.generateUUID();
          var entity = { permalink : common.hrefs.TRANSACTIONS+ '/' + testTransactionKey,
                       login: steven.login,
                       password: steven.password };
          entityStore.push(entity);
          var testTransaction = {
            from : {
              href : common.hrefs.PARTY_STEVEN
            },
            to: {
              href : common.hrefs.PARTY_ANNA
            },
            amount: 25,
            description: common.randomString(50)
          };
          return doPut(common.hrefs.TRANSACTIONS + '/' + testTransactionKey, testTransaction, steven.login, steven.password).then(
            function(result){
              assert.equal(result.statusCode, common.responses.CREATED);
              doGet(common.hrefs.TRANSACTIONS + '/' + testTransactionKey, steven.login, steven.password).then(
                function(response2) {
                  assert.equal(response2.statusCode, common.responses.OK);
                  done();
              },done).done()
            },done)
        });
        it('should not be possible to add a transaction as the initiating party for a non accessible party');
        it('should not be possible to add a transaction as the not initating party, unless as superadmin');
        it('should not be possible to update a transaction as a non superadmin');
        it('should be possbile to update a transaction as a superadmin');
    });
    describe('DELETE', function() {
        it('should be possible to delete a transaction as superadmin');
        it('should not be possible to delete a transaction as a non superadmin');
    })
    
  });
};
