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

  describe('/messages', function () {
    describe('GET', function () {

      it('should support retrieving reachable parties for multiple start nodes', function () {
        return doGet(base + '/parties?reachableFromParties=' +
            common.hrefs.PARTY_ANNA + ',' +
            common.hrefs.PARTY_STEVEN, 'annadv', 'test').then(function (response) {
          debug(response);
          var hrefs = [];
          assert.equal(response.statusCode, 200);
          hrefs = createHrefArray(response);

          expect(hrefs).to.contain(common.hrefs.PARTY_LETSDENDERMONDE);
          expect(hrefs).to.contain(common.hrefs.PARTY_LETSLEBBEKE);
          // Eddy is inactive in LETS Lebbeke, so should not be found..
          expect(hrefs).to.not.contain(common.hrefs.PARTY_EDDY);
          expect(hrefs).to.contain(common.hrefs.PARTY_RUDI);
          // Steven is reachable from Anna !
          expect(hrefs).to.contain(common.hrefs.PARTY_STEVEN);
          // Anna is reachable from Steven !
          expect(hrefs).to.contain(common.hrefs.PARTY_ANNA);
        });
      });
    });
  });
};
