var assert = require('assert');
var sriclient = require('sri4node-client');
var doGet = sriclient.get;
var common = require('./common.js');
var cl = common.cl;

var createHrefArray = common.createHrefArray;
var getResultForHref = common.getResultForHref;
var expect = require('chai').expect;

exports = module.exports = function (base, logverbose) {
  'use strict';

  function debug(x) {
    if (logverbose) {
      cl(x); // eslint-disable-line
    }
  }
  
  describe('/messagetransactions', function () {
    describe('GET', function () {
      it('should allow full list retrieval of accessible relations');
    });
    describe('PUT', function() {
      it('should allow creating a new relation from a transaction you participate in');
      it('should not allow creating a new relation from a transaction you do not participate in');
      it('should allow a superadmin to create a new relation from a transaction you do not participate in');
      it('should not allow creating a new relation to a message that is not accessible.');
    });
    describe('DELETE', function() {
      it('should allow deleting a relation from a transaction you participate in');
      it('should not allow deleting a relation from a transaction you do not participate in');
      it('should allow a superadmin to delete a relation from a transaction you do not participate in');
    });
  });
}