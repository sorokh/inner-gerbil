var assert = require('assert');
var sriclient = require('sri4node-client');
var doGet = sriclient.get;
var common = require('./common.js');
var createHrefArray = common.createHrefArray;
var expect = require('chai').expect;

exports = module.exports = function (base, logverbose) {
  'use strict';

  function debug (x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  describe('/messages', function () {
    describe('GET', function () {
      it('should allow full list retrieval.', function () {
        return doGet(base + '/messages').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          if (response.body.$$meta.count < 6) {
            assert.fail('Expected all messages');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain('/messages/a998ff05-1291-4399-8604-16001015e147');
          expect(hrefs).to.contain('/messages/b7c41d85-687d-4f9e-a4ef-0c67515cbb63');
          expect(hrefs).to.contain('/messages/1f2e1d34-c3b7-42e8-9478-45cdc0839427');
          expect(hrefs).to.contain('/messages/0cc3d15f-47ef-450a-a0ac-518202d7a67b');
          expect(hrefs).to.contain('/messages/642f3d85-a21e-44d0-b6b3-969746feee9b');
          expect(hrefs).to.contain('/messages/d1c23a0c-4420-4bd3-9fa0-d542b0155a15');
        });
      });
    });
  });
};
