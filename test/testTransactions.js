var assert = require('assert');
var sriclient = require('sri4node-client');
var doGet = sriclient.get;
var common = require('./common.js');
var createHrefArray = common.createHrefArray;
var expect = require('chai').expect;

exports = module.exports = function (base, logverbose) {
  'use strict';

  function debug(x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  describe('/transactions', function () {
    describe('GET', function () {
      it('should allow full list retrieval.', function () {
        return doGet(base + '/transactions', 'annadv', 'test').then(function (response) {
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

      it('should support ?involvingAncestorsOfParties=ANNA', function () {
        return doGet(base + '/transactions?involvingAncestorsOfParties=' +
                     common.hrefs.PARTY_ANNA, 'annadv', 'test').then(function (response) {
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
        return doGet(base + '/transactions?involvingDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, 'annadv', 'test').then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        });
      });

      it('should allow parameter ?involvingDescendantsOfParties=DENDERMONDE', function () {
        return doGet(base + '/transactions?involvingDescendantsOfParties=' +
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
        return doGet(base + '/transactions?fromDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, 'annadv', 'test').then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        }).then(function () {
          return doGet(base + '/transactions?fromDescendantsOfParties=' +
                       common.hrefs.PARTY_LETSDENDERMONDE, 'annadv', 'test').then(function (response) {
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
        return doGet(base + '/transactions?toDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, 'annadv', 'test').then(function (response) {
          debug('statusCode : ' + response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.TRANSACTION_ANNA_STEVEN_20);
          expect(hrefs).to.not.contain(common.hrefs.TRANSACTION_LEEN_EMMANUELLA_20);
        }).then(function () {
          return doGet(base + '/transactions?toDescendantsOfParties=' +
                       common.hrefs.PARTY_LETSDENDERMONDE, 'annadv', 'test').then(function (response) {
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
  });
};
