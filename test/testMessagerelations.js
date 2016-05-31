var assert = require('assert');
var async = require('async');
var moment = require('moment');
var sriclient = require('sri4node-client');
var common = require('./common.js');
var cl = common.cl;
var anna = common.accounts.ANNA;
var steven = common.accounts.STEVEN;
var walter = common.accounts.WALTER;
var emmanuella = common.accounts.EMMANUELLA;
var ruud = common.accounts.RUUD;

var createHrefArray = common.createHrefArray;
var getResultForHref = common.getResultForHref;
var expect = require('chai').expect;

exports = module.exports = function (base, logverbose) {
  'use strict';

  var doGet = common.doGet(base);
  var doPut = common.doPut(base);
  var doDelete = common.doDelete(base);
  
  var entityStore = [];
  
  function generateRandomMessage(me) {

    return {
      author: {
            href: me.href
          },
      title: common.randomString(50),
      description: common.randomHTMLString(200),
      eventdate: moment(),
      amount: 25,
      unit: 'hour',
      tags:  [
        'test', 'generic', 'computer'
        ],
      photos: [],
      created: moment(),
      modified: moment()
    };
  }

  function debug(x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  describe('/messagerelations', function () {
    describe('GET', function () {
      it('should allow full [anna] list retrieval of accessible relations', function () {
        return doGet(common.hrefs.MESSAGE_RELATIONS, anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, common.responses.OK);
          if (response.body.$$meta.count < 1) {
            assert.fail('Expected all messages');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.MESSAGE_RELATION_ASPERGES);
          expect(response.body.results.filter(function(row){
            if(row.href==common.hrefs.MESSAGE_RELATION_ASPERGES && row.$$expanded.$$meta){
              return true;
            }else{
              return false;
            }
          }).length).to.be.least(1);
        });
      });
      it('should allow full [emmanuella] list retrieval of accessible relations', function () {
        return doGet(common.hrefs.MESSAGE_RELATIONS, emmanuella.login, emmanuella.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, common.responses.OK);

          var hrefs = createHrefArray(response);
          expect(response.body.results.filter(function(row){
            if(row.href==common.hrefs.MESSAGE_RELATION_ASPERGES && row.$$expanded.$$meta){
              return true;
            }else{
              return false;
            }
          }).length).to.equal(0);
        });
      });
    });
    describe('PUT', function () {
      var uuid_msg_anna = common.generateUUID();
      var uuid_msg_steven= common.generateUUID();
      var uuid_msg_parties = common.generateUUID();
      var testMessageAnna = generateRandomMessage({href: common.hrefs.PARTY_ANNA
      });
      var testMessageSteven = generateRandomMessage({href: common.hrefs.PARTY_STEVEN
      });
      var testMessageParties = {
        message: {
          href: common.hrefs.MESSAGES + '/' + uuid_msg_anna
        },
        party: {
          href: common.hrefs.PARTY_LETSLEBBEKE
        }
      };
      var body = [
          {
            href: common.hrefs.MESSAGES + '/' + uuid_msg_anna,
            verb: 'PUT',
            body:  testMessageAnna
          },
          {
            href: common.hrefs.MESSAGES + '/' + uuid_msg_steven,
            verb: 'PUT',
            body: testMessageSteven
          },
          {
            href: common.hrefs.MESSAGE_PARTIES + '/' + uuid_msg_parties,
            verb: 'PUT',
            body: testMessageParties
          }
        ];
      
        //Cleanup after each test.
      afterEach('cleanup test created data', function (cleanupDone) {
        async.each(entityStore, function (entity, callback) {
          doDelete(entity.permalink, entity.login, entity.password).then(
              function (response) {
                entityStore = entityStore.filter(function (e) {return e !== entity; });
                callback();
              }).done();
        }, function (res) {cleanupDone(); });
      });

      before(function (done) {
        doPut(common.hrefs.BATCH,body, ruud.login, ruud.password).then(
          function(resp){
            done();
        }).done();
      });

      after(function (done) {
        doDelete(common.hrefs.MESSAGES+'/'+uuid_msg_anna, ruud.login, ruud.password)
            .then(function (resp) { 
              doDelete(common.hrefs.MESSAGES+'/'+uuid_msg_anna, ruud.login, ruud.password)
              .then(function (resp) {done(); }, done) }, done);
            
      });

      
      it('should allow creating a new relation from a message you own', function(done) {
        var entity = { permalink : common.hrefs.MESSAGE_RELATIONS + '/' + common.generateUUID(),
                       login: steven.login,
                       password: steven.password };
        entityStore.push(entity);
        var relation = {
          to: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_anna
          },
          from: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_steven
          },
          type: 'response_private'
        }
        return doPut(entity.permalink, relation, steven.login , steven.password).then(
          function (response) {
            debug(response.body);
            assert.equal(response.statusCode, common.responses.CREATED);
            done();
          }, 
          done);
      });
      it('should not allow creating a new relation from a message you do not own',function(done){
        var entity = { permalink : common.hrefs.MESSAGE_RELATIONS + '/' + common.generateUUID(),
                       login: steven.login,
                       password: steven.password };
        entityStore.push(entity);
        var relation = {
          to: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_steven
          },
          from: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_anna
          },
          type: 'response_private'
        }
        return doPut(entity.permalink, relation, steven.login , steven.password).then(
          function (response) {
            debug(response.body);
            assert.equal(response.statusCode, common.responses.FORBIDDEN);
            done();
          }, 
          done);
      });
      it('should allow a superadmin to create a new relation from a message you do not own', function (done){
        var entity = { permalink : common.hrefs.MESSAGE_RELATIONS + '/' + common.generateUUID(),
                       login: steven.login,
                       password: steven.password };
        entityStore.push(entity);
        var relation = {
          to: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_steven
          },
          from: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_anna
          },
          type: 'response_private'
        }
        return doPut(entity.permalink, relation, steven.login , steven.password).then(
          function (response) {
            debug(response.body);
            assert.equal(response.statusCode, common.responses.FORBIDDEN);
            done();
          }, 
          done);
      });
      it('should not allow creating a new relation to a message that is not accessible.',function(done) {
        var entity = { permalink : common.hrefs.MESSAGE_RELATIONS + '/' + common.generateUUID(),
                       login: steven.login,
                       password: steven.password };
        entityStore.push(entity);
        var relation = {
          to: {
              href: common.hrefs.MESSAGE_LEEN_PLANTS
          },
          from: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_steven
          },
          type: 'response_private'
        }
        return doPut(entity.permalink, relation, steven.login , steven.password).then(
          function (response) {
            debug(response.body);
            assert.equal(response.statusCode, common.responses.FORBIDDEN);
            done();
          }, 
          done);
      });
    });
    describe('DELETE', function () {
      var uuid_msg_anna = common.generateUUID();
      var uuid_msg_steven= common.generateUUID();
      var uuid_msg_parties = common.generateUUID();
      var testMessageAnna = generateRandomMessage({href: common.hrefs.PARTY_ANNA
      });
      var testMessageSteven = generateRandomMessage({href: common.hrefs.PARTY_STEVEN
      });
      var testMessageParties = {
        message: {
          href: common.hrefs.MESSAGES + '/' + uuid_msg_anna
        },
        party: {
          href: common.hrefs.PARTY_LETSLEBBEKE
        }
      };
      var body = [
          {
            href: common.hrefs.MESSAGES + '/' + uuid_msg_anna,
            verb: 'PUT',
            body:  testMessageAnna
          },
          {
            href: common.hrefs.MESSAGES + '/' + uuid_msg_steven,
            verb: 'PUT',
            body: testMessageSteven
          },
          {
            href: common.hrefs.MESSAGE_PARTIES + '/' + uuid_msg_parties,
            verb: 'PUT',
            body: testMessageParties
          }
        ];
      
        //Cleanup after each test.
      afterEach('cleanup test created data', function (cleanupDone) {
        async.each(entityStore, function (entity, callback) {
          doDelete(entity.permalink, entity.login, entity.password).then(
              function (response) {
                entityStore = entityStore.filter(function (e) {return e !== entity; });
                callback();
              }).done();
        }, function (res) {cleanupDone(); });
      });

      before(function (done) {
        doPut(common.hrefs.BATCH,body, ruud.login, ruud.password).then(
          function(resp){
            done();
        }).done();
      });

      after(function (done) {
        doDelete(common.hrefs.MESSAGES+'/'+uuid_msg_anna, ruud.login, ruud.password)
            .then(function (resp) { 
              doDelete(common.hrefs.MESSAGES+'/'+uuid_msg_anna, ruud.login, ruud.password)
              .then(function (resp) {done(); }, done) }, done);
            
      });
      
      it('should allow deleting a relation from a message you own', function(done) {
        var entity = { permalink : common.hrefs.MESSAGE_RELATIONS + '/' + common.generateUUID(),
                       login: steven.login,
                       password: steven.password };
        entityStore.push(entity);
        var relation = {
          to: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_anna
          },
          from: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_steven
          },
          type: 'response_private'
        }
        return doPut(entity.permalink, relation, steven.login , steven.password).then(
          function (response) {
            assert.equal(response.statusCode, common.responses.CREATED);
            doDelete(entity.permalink,steven.login , steven.password).then(
              function (response2){
                debug(response2.body);
                assert.equal(response2.statusCode, common.responses.OK);
                done();
              }, done ).done();
          }, 
          done);
      });
      it('should not allow deleting a relation from a message you don not own', function(done) {
        var entity = { permalink : common.hrefs.MESSAGE_RELATIONS + '/' + common.generateUUID(),
                       login: steven.login,
                       password: steven.password };
        entityStore.push(entity);
        var relation = {
          to: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_anna
          },
          from: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_steven
          },
          type: 'response_private'
        }
        return doPut(entity.permalink, relation, steven.login , steven.password).then(
          function (response) {
            assert.equal(response.statusCode, common.responses.CREATED);
            doDelete(entity.permalink,anna.login , anna.password).then(
              function (response2){
                debug(response2.body);
                assert.equal(response2.statusCode, common.responses.FORBIDDEN);
                done();
              }, done ).done();
          }, 
          done);
      });
      it('should allow a superadmin to delete a relation from a message you do not own', function(done) {
        var entity = { permalink : common.hrefs.MESSAGE_RELATIONS + '/' + common.generateUUID(),
                       login: steven.login,
                       password: steven.password };
        entityStore.push(entity);
        var relation = {
          to: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_anna
          },
          from: {
              href: common.hrefs.MESSAGES + '/' + uuid_msg_steven
          },
          type: 'response_private'
        }
        return doPut(entity.permalink, relation, steven.login , steven.password).then(
          function (response) {
            assert.equal(response.statusCode, common.responses.CREATED);
            doDelete(entity.permalink,ruud.login , ruud.password).then(
              function (response2){
                debug(response2.body);
                assert.equal(response2.statusCode, common.responses.OK);
                done();
              }, done ).done();
          }, 
          done);
      });
    });
  });
};
