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

  describe('/contactdetails', function () {
    describe('GET', function () {
      it('should allow full list retrieval.', function () {
        return doGet(base + '/contactdetails').then(function (response) {
          assert.equal(response.statusCode, 200);
          if (response.body.$$meta.count < 3) {
            assert.fail('Expected all contactdetails');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain('/contactdetails/843437b3-29dd-4704-afa8-6b06824b2e92');
          expect(hrefs).to.contain('/contactdetails/b059ef61-340c-45d8-be4f-02436bcc03d9');
          expect(hrefs).to.contain('/contactdetails/96de9531-d777-4dca-9997-7a774d2d7595');
        });
      });

      it('should support ?relatedToMessages=', function () {
        return doGet(base + '/contactdetails?relatedToMessages=/messages/d1c23a0c-4420-4bd3-9fa0-d542b0155a15')
          .then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          assert.equal(response.body.results[0].href, '/contactdetails/3362d325-cf19-4730-8490-583da50e114e');
        });
      });
    });
  });
};
