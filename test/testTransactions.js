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
        return doGet(base + '/transactions').then(function (response) {
          assert.equal(response.statusCode, 200);
          // TODO: add more transactions to test data
          if (response.body.$$meta.count < 2) {
            assert.fail('Expected all transactions');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain('/transactions/e068c284-26f1-4d11-acf3-8942610b26e7');
          expect(hrefs).to.contain('/transactions/1ffc9267-b51f-4970-91a2-ae20f4487f78');
        });
      });

      it('should support ?forMessages=', function () {
        return doGet(base + '/transactions?forMessages=/messages/e24528a5-b12f-417a-a489-913d5879b895')
          .then(function (response) {
          debug('xxx');
          debug(response.body);
          assert.equal(response.statusCode, 200);
          assert.equal(response.body.results[0].href, '/transactions/1ffc9267-b51f-4970-91a2-ae20f4487f78');
        });
      });
    });
  });
};
