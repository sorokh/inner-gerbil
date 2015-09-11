var assert = require('assert');
var sriclient = require('sri4node-client');
var doGet = sriclient.get;
//var common = require('./common.js');
//var createHrefArray = common.createHrefArray;
var expect = require('chai').expect;

exports = module.exports = function (base, logverbose) {
  'use strict';

  function debug(x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  describe('/parties', function () {
    describe('GET', function () {
      it('should allow full list retrieval.', function () {
        return doGet(base + '/parties').then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          if (response.body.$$meta.count < 4) {
            assert.fail('Expected all parties');
          }
        });
      });

      it('should support parentsOf as URL parameter', function () {
        // Find parents of LETS Lebbeke, should return LETS Regio Dendermonde
        return doGet(base + '/parties?parentsOf=/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5')
          .then(function (response) {
            assert.equal(response.statusCode, 200);
            assert.equal(response.body.$$meta.count, 1);
            assert.equal(response.body.results[0].href, '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849');
          });
      });

      it('should support parentsOf with multiple parameters', function () {
        return doGet(base + '/parties?parentsOf=' +
            '/parties/5df52f9f-e51f-4942-a810-1496c51e64db,/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504')
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, 200);
            assert.equal(response.body.$$meta.count, 2);
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });
            // LETS Dendermonde
            if (hrefs.indexOf('/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849') === -1) {
              assert.fail();
            }
            // LETS Lebbeke
            if (hrefs.indexOf('/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5') === -1) {
              assert.fail();
            }
          });
      });

      it('should support retrieving all reachable parties ?reachableFrom', function () {
        return doGet(base + '/parties?reachableFrom=/parties/5df52f9f-e51f-4942-a810-1496c51e64db')
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, 200);
            if (response.body.count < 4) {
              assert.fail('Expected all parties');
            }
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });

            // LETS Dendermonde
            expect(hrefs).to.contain('/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849');
            // LETS Lebbeke
            expect(hrefs).to.contain('/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5');
            // Steven Buytinck
            expect(hrefs).to.contain('/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504');
          });
      });

      it('should support retrieving reachable parties for multiple start nodes', function () {
        return doGet(base + '/parties?reachableFrom=/parties/5df52f9f-e51f-4942-a810-1496c51e64db,' +
            '/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504')
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, 200);
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });

            // LETS Dendermonde
            expect(hrefs).to.contain('/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849');
            // LETS Lebbeke
            expect(hrefs).to.contain('/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5');
            // Steven Buytinck
            expect(hrefs).to.contain('/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504');
            // Anna
            expect(hrefs).to.contain('/parties/5df52f9f-e51f-4942-a810-1496c51e64db');
          });
      });

      it('should support retrieving all parties of type "person"', function () {
        return doGet(base + '/parties?type=person')
          .then(function (response) {
            assert.equal(response.statusCode, 200);
            if (response.body.count < 2) {
              assert.fail('Expected all parties');
            }
            assert.equal(response.body.results[0].$$expanded.type, 'person');
            assert.equal(response.body.results[1].$$expanded.type, 'person');
          });
      });

      it('should support retrieve all children below 1 node', function () {
        return doGet(base + '/parties?childrenOf=/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849')
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, 200);
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });

            // LETS Lebbeke
            expect(hrefs).to.contain('/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5');
            // Steven Buytinck
            expect(hrefs).to.contain('/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504');
            // Anna
            expect(hrefs).to.contain('/parties/5df52f9f-e51f-4942-a810-1496c51e64db');
          });
      });

      it('should support retrieve all children below 1 node & of a certain type', function () {
        return doGet(base + '/parties?childrenOf=/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849&type=person')
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, 200);
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });

            // LETS Lebbeke should be ABSENT
            expect(hrefs).not.to.contain('/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5');
            // Steven Buytinck
            expect(hrefs).to.contain('/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504');
            // Anna
            expect(hrefs).to.contain('/parties/5df52f9f-e51f-4942-a810-1496c51e64db');
          });
      });

      it('should support ?forMessages=...', function () {
        return doGet(base + '/parties?forMessages=/messages/e24528a5-b12f-417a-a489-913d5879b895')
          .then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          assert.equal(response.body.results[0].href, '/parties/0a98e68d-1fb9-4a31-a4e2-9289ee2dd301');
        });
      });
    });
  });

};