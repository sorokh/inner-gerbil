var assert = require('assert');
var sriclient = require('sri4node-client');
var common = require('./common.js');
var cl = common.cl;
var anna = common.accounts.ANNA;
var walter = common.accounts.WALTER;
var emmanuella = common.accounts.EMMANUELLA;

var createHrefArray = common.createHrefArray;
var getResultForHref = common.getResultForHref;
var expect = require('chai').expect;

exports = module.exports = function (base, logverbose) {
  'use strict';

  var doGet = common.doGet(base);
  var doPut = common.doPut(base);
  var doDelete = common.doDelete(base);


  function debug(x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  describe.only('/messagerelations', function () {
    describe('GET', function () {
      it('should allow full list retrieval of accessible relations', function () {
        return doGet(common.hrefs.MESSAGE_RELATIONS, anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, common.responses.OK);
          if (response.body.$$meta.count < 1) {
            assert.fail('Expected all messages');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_RELATION_ASPERGES);
        });
      });
      it('should allow full list retrieval of accessible relations', function () {
        return doGet(common.hrefs.MESSAGE_RELATIONS, emmanuella.login, emmanuella.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, common.responses.OK);
          /*if (response.body.$$meta.count < 1) {
            assert.fail('Expected all messages');
          }*/
          var hrefs = createHrefArray(response);
          expect(hrefs).to.not.contain(common.hrefs.MESSAGE_RELATION_ASPERGES);
        });
      });
    });
    describe('PUT', function () {
      it('should allow creating a new relation from a message you own');
      it('should not allow creating a new relation from a message you do not own');
      it('should allow a superadmin to create a new relation from a message you do not own');
      it('should not allow creating a new relation to a message that is not accessible.');
    });
    describe('DELETE', function () {
      it('should allow deleting a relation from a message you own');
      it('should not allow deleting a relation from a message you don not own');
      it('should allow a superadmin to delete a relation from a message you do not own');
    });
  });
};
