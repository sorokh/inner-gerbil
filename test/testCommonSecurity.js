var Q = require('q');
var assert = require('assert');
var chai = require('chai');
var security = require('../js/commonSecurity.js');


exports = module.exports = function (base, logverbose) {
  'use strict';

  function debug(x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  function rejectReadAccess() {
    var q = Q.deferred();
    q.reject('Access not allowed');
    return q.promise;
  }

  describe('validate access', function () {
    it('should allow read access by default', function (done) {
      var promise = security.checkAccessOnResource(null,
        {
          method: 'GET',
          params: {
            key: '1234'
          },
          url: '/test/1234',
          body: {
            type: 'DUMMY'
          }
        }, null, null, {
          adminrole: 'none'
        }, null);
      promise.done(function () {
        assert.equal(promise.isRejected(), false, 'should have rejected promise');
        done();
      }, function () {
        assert.equal(promise.isRejected(), false, 'should have rejected promise');
        done();
      });
    });
    it('should refuse read access by configuration', function (done) {
      var promise = security.checkAccessOnResource(null,
        {
          method: 'GET',
          params: {
            key: '1234'
          },
          url: '/test/1234',
          body: {
            type: 'DUMMY'
          }
        }, null, null, {
          adminrole: 'none'
        }, null, {read: security.rejectAccess});
      promise.then(function () {
        assert.ok(false, 'should have rejected promise');
        done();
      }, function () {
        assert.ok(true, 'should have rejected promise');
        done();
      });
    });
    it('should refuse read access by local configuration', function (done) {
      var promise = security.checkAccessOnResource(null,
        {
          method: 'GET',
          params: {
            key: '1234'
          },
          url: '/test/1234',
          body: {
            type: 'DUMMY'
          }
        }, null, null, {
          adminrole: 'none'
        }, null, {read: security.rejectAccess});
      promise.done(function () {
        assert.equal(promise.isRejected(), true, 'should have rejected promise');
        done();
      }, function () {
        assert.equal(promise.isRejected(), true, 'should have rejected promise');
        done();
      });
    });
    it('should allow update access by default', function (done) {
      security.checkAccessOnResource(null,
        {
          method: 'PUT',
          params: {
            key: '1234'
          },
          url: '/test/1234',
          body: {
            type: 'DUMMY'
          }
        }, null, null, {
          adminrole: 'none'
        }, null).then(
        done(),
        function () {
          assert.ok(false, 'should have rejected promise');
          done();
        }).done();
    });
    it('should allow create access by default', function (done) {
      var promise = security.checkAccessOnResource(null,
        {
          method: 'PUT',
          params: {
            key: '1234'
          },
          url: '/test/1234',
          body: {
            type: 'DUMMY'
          }
        }, null, null, {
          adminrole: 'none'
        }, null);
      promise.then(
        function () {
          done();
        },
        function () {
          assert.ok(false, 'should have rejected promise');
          done();
        });
    });
    it('should allow delete access by default', function (done) {
      var promise = security.checkAccessOnResource(null,
        {
          method: 'DELETE',
          params: {
            key: '1234'
          },
          url: '/test/1234',
          body: {
            type: 'DUMMY'
          }
        }, null, null, {
          adminrole: 'none'
        }, null);
      promise.done(function () {
        assert.equal(promise.isRejected(), false, 'should have rejected promise');
        done();
      }, function () {
        assert.equal(promise.isRejected(), false, 'should have rejected promise');
        done();
      });
    });
    it('should deny other access by default', function (done) {
      var promise = security.checkAccessOnResource(null,
        {
          method: 'OPTIONS',
          params: {
            key: '1234'
          },
          url: '/test/1234',
          body: {
            type: 'DUMMY'
          }
        }, null, null, {
          adminrole: 'none'
        }, null);
      promise.done(function () {
        assert.equal(promise.isRejected(), true, 'should have rejected promise');
        done();
      }, function () {
        assert.equal(promise.isRejected(), true, 'should have rejected promise');
        done();
      });
    });
  });
};
