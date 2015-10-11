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
      it('should allow full list retrieval.', function () {
        return doGet(base + '/messages', 'annadv', 'test').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          if (response.body.$$meta.count < 6) {
            assert.fail('Expected all messages');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
        });
      });

      it('should support ?postedInDescendantsOfParties=LEBBEKE', function () {
        return doGet(base + '/messages?postedInDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, 'annadv', 'test').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_WINDOWS);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
        });
      });

      it('should support ?postedInDescendantsOfParties=DENDERMONDE', function () {
        return doGet(base + '/messages?postedInDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSDENDERMONDE, 'annadv', 'test').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_WINDOWS);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
        });
      });

      it('should support ?postedInDescendantsOfParties=HAMME', function () {
        return doGet(base + '/messages?postedInDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSHAMME, 'annadv', 'test').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_ANNA_WINDOWS);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
        });
      });

      it('should support ?postedByDescendantsOfParties=LEBBEKE', function () {
        return doGet(base + '/messages?postedByDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, 'annadv', 'test').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_WINDOWS);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
        });
      });

      it('should support ?postedByDescendantsOfParties=DENDERMONDE', function () {
        return doGet(base + '/messages?postedByDescendantsOfParties=' +
                     common.hrefs.PARTY_LETSDENDERMONDE, 'annadv', 'test').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_WINDOWS);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
        });
      });

      it('should support ?descendantsOfMessages=x', function () {
        return doGet(base + '/messages?descendantsOfMessages=' +
                     common.hrefs.MESSAGE_ANNA_ASPERGES, 'annadv', 'test').then(function (response) {
          debug(response.statusCode);
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_REPLY_TO_ASPERGES);
        });
      });

      it('should support ?postedInPartiesReachableFromParties=ANNA', function () {
        return doGet(base + '/messages?postedInPartiesReachableFromParties=' +
                     common.hrefs.PARTY_ANNA, 'annadv', 'test').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_WINDOWS);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
        });
      });


      it('should support ?postedInAncestorsOfParties=ANNA', function () {
        return doGet(base + '/messages?postedInAncestorsOfParties=' +
                     common.hrefs.PARTY_ANNA, 'annadv', 'test').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_WINDOWS);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
        });
      });

      it('should support ?postedByPartiesInLatLong=...', function () {
        return doGet(base + '/messages?postedByPartiesInLatLong=50.9,51.0,4.1,4.2', 'annadv', 'test').then(function (
          // Anna and LETS Dendermonde are in this geo area.
          response) {
          console.log(response.body);
          assert.equal(response.statusCode, 200);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_ASPERGES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_CHUTNEY);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_VEGGIE_KOOKLES);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_ANNA_WINDOWS);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_STEVEN_INDISCH);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_STEVEN_SWITCH);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_RUDI_WEBSITE);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_LEEN_PLANTS);
        });
      });
    });
  });
};
