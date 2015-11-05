var assert = require('assert');
var sriclient = require('sri4node-client');
var doGet = sriclient.get;
var doPut = sriclient.put;
var common = require('./common.js');
var createHrefArray = common.createHrefArray;
var expect = require('chai').expect;
var anna = common.accounts.ANNA;
var responseCodes = common.responses;

exports = module.exports = function (base, logverbose) {
  'use strict';

  var doGet = common.doGet(base);
  var doPut = common.doPut(base);
  var doDelete = common.doDelete(base);
  var $u = sri4node.utils;

  var entityStore = [];

  function generateRandomPerson() {
    return {
      type: "person",
      name: "Tàs Adélàç",
      alias: "àçélè",
      dateofbirth: new Date("01/12/1969").toJSON(),
      imageurl: "http://imagesource.net/az453SDF.png",
      login: "àçélè",
      password: "@#!kqlk&)àç",
      status: "active"
    };
  }

  function generateRandomGroup( type ) {
    return {
      type: type,
      name: "Tàs Adélàç",
      alias: "àçélè",
      dateofbirth: "1969-12-01",
      imageurl: "http://imagesource.net/az453SDF.png",
      secondsperunit: "16",
      currencyname: "lapkes",
      status: "active"
    };
  }

  function debug(x) {
    if (logverbose) {
      console.log(x); // eslint-disable-line
    }
  }

  describe('/parties/{party_id}', function () {
    describe('GET', function () {
      it('should allow the retrieval of a party.', function (){
        return doGet(common.hrefs.PARTY_ANNA, anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.OK);
          assert.equal(response.body.$$meta.permalink,common.hrefs.PARTY_ANNA);
          });
        });
      it('should fail on the retrieval of a non existing party', function (){
        return doGet(common.hrefs.PARTY_DUMMY, anna.login, anna.password).then(function (response){
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.NOT_FOUND);
        });
      });
    });

    describe('PUT', function (){
      var testReferenceParty = generateRandomPerson();
      testReferenceParty.login="testLogin";
      var testReferencePartyLink = common.hrefs.PARTIES + '/' + common.generateKey();

      afterEach(function () {
        entityStore.forEach(function (id, i, array) {
          doDelete(id,anna.login,anna.password).then(
              function (response){
                debug(response.body);
                entityStore = entityStore.filter(function (e) {return e!==id;});
              });
        });
      });

      before(function () {
        doPut( testReferencePartyLink, testReferenceParty, anna.login, anna.password);
      });

      after(function () {
        doDelete(testReferencePartyLink, anna.login, anna.password);
      })

      it('should allow the creation of a party, if you have sufficient rights to do so.', function () {
        var testPartyPermaLink = common.hrefs.PARTIES + '/' + common.generateKey();
        entityStore.push(testPartyPermaLink);
        return doPut(testPartyPermaLink, generateRandomPerson(), anna.login, anna.password).then(function (response){
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.CREATED);
        });
      });
      it('should disallow the creation of a party, if you don\'t have sufficient rights to do so.');
      it('should disallow the creation of duplicates (login,alias)', function () {
        var testPartyPermaLink = common.hrefs.PARTIES + '/' + common.generateKey();
        entityStore.push(testPartyPermaLink);

        return doPut(testPartyPermaLink, generateRandomPerson(), anna.login, anna.password).then(function (response){
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.CONFLICT);
        });
      });
      it('should allow the creation of accounts with the same personal data (name,surname,birthday)' , function () {
        var testPartyPermaLink = common.hrefs.PARTIES + '/' + common.generateKey();
        entityStore.push(testPartyPermaLink);
        var testPartyPermaLink2 = common.hrefs.PARTIES + '/' + common.generateKey();
        entityStore.push(testPartyPermaLink2);
        return doPut(testPartyPermaLink, generateRandomPerson(), anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.CREATED);
          doPut(testPartyPermaLink2, generateRandomPerson(), anna.login, anna.password).then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.CREATED);
          });
        });
      });
      it('should disallow the creation of (sub-)groups with the same name');
      it('should allow the update of a party, if you have sufficient rights to do so.');
      it('should disallow the update of a party, if it\'s not yourself and you don\'t have sufficient administrative rights');
    });
  });
  describe('/parties', function () {
    describe('GET', function () {
      it('should allow full list retrieval.', function () {
        return doGet(common.hrefs.PARTIES, anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.OK);
          if (response.body.$$meta.count < 4) {
            assert.fail('Expected all parties');
          }
        });
      });

      it('should support ancestorsOfParties as URL parameter', function () {
        // Find parents of LETS Lebbeke, should return LETS Regio Dendermonde
        return doGet(common.hrefs.PARTIES +'?ancestorsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, anna.login, anna.password)
          .then(function (response) {
            assert.equal(response.statusCode, responseCodes.OK);
            assert.equal(response.body.$$meta.count, 1);
            assert.equal(response.body.results[0].href, '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849');
          });
      });

      it('should support ancestorsOfParties with multiple parameters', function () {
        return doGet(common.hrefs.PARTIES+'?ancestorsOfParties=' +
                common.hrefs.PARTY_ANNA +',' + common.hrefs.PARTY_STEVEN,
                anna.login, anna.password)
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, responseCodes.OK);
            assert.equal(response.body.$$meta.count, 2);
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });
            // LETS Dendermonde
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSDENDERMONDE);

            // LETS Lebbeke
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSLEBBEKE);
          });
      });

      it('should support retrieving all reachable parties ?reachableFromParties', function () {
        return doGet(common.hrefs.PARTIES + '?reachableFromParties=' +
                     common.hrefs.PARTY_ANNA, anna.login, anna.password)
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, responseCodes.OK);
            if (response.body.count < 4) {
              assert.fail('Expected all parties');
            }
            hrefs = common.createHrefArray(response);

            // LETS Dendermonde
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSDENDERMONDE);
            // LETS Lebbeke
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSLEBBEKE);
            // Steven Buytinck
            expect(hrefs).to.contain(common.hrefs.PARTY_STEVEN);
          });
      });

      it('should support retrieving reachable parties for multiple start nodes', function () {
        return doGet(common.hrefs.PARTIES + '?reachableFromParties=' +
            common.hrefs.PARTY_ANNA + ',' + common.hrefs.PARTY_STEVEN,
            anna.login, anna.password)
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, responseCodes.OK);
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });

            // LETS Dendermonde
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSDENDERMONDE);
            // LETS Lebbeke
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSLEBBEKE);
            // Steven Buytinck
            expect(hrefs).to.contain(common.hrefs.PARTY_STEVEN);
            // Anna
            expect(hrefs).to.contain(common.hrefs.PARTY_ANNA);
            // Eddy is inactive in LETS Lebbeke, so should not be found..
            expect(hrefs).to.not.contain(common.hrefs.PARTY_EDDY);
            expect(hrefs).to.contain(common.hrefs.PARTY_RUDI);

            // TODO ! When using multiple roots, root A can be reachable from root B, and vice-versa...
            // This does not work correclty now. It does work correctly for a single root.
            // Steven is reachable from Anna !
            //expect(hrefs).to.contain(common.hrefs.PARTY_STEVEN);
            // Anna is reachable from Steven !
            //expect(hrefs).to.contain(common.hrefs.PARTY_ANNA);
          });
      });

      it('should support retrieving all parties of type "person"', function () {
        return doGet(common.hrefs.PARTIES + '?type=person', anna.login, anna.password)
          .then(function (response) {
            assert.equal(response.statusCode, responseCodes.OK);
            if (response.body.count < 2) {
              assert.fail('Expected all parties');
            }
            assert.equal(response.body.results[0].$$expanded.type, 'person');
            assert.equal(response.body.results[1].$$expanded.type, 'person');
          });
      });

      it('should support retrieve all children below 1 node', function () {
        return doGet(common.hrefs.PARTIES + '?descendantsOfParties=' +
                    common.hrefs.PARTY_LETSDENDERMONDE, anna.login, anna.password)
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, responseCodes.OK);
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });

            // LETS Lebbeke
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSLEBBEKE);
            // Steven Buytinck
            expect(hrefs).to.contain(common.hrefs.PARTY_STEVEN);
            // Anna
            expect(hrefs).to.contain(common.hrefs.PARTY_ANNA);
          });
      });

      it('should support retrieve all children below 1 node & of a certain type', function () {
        return doGet(common.hrefs.PARTIES + '?descendantsOfParties=' +
                    common.hrefs.PARTY_LETSDENDERMONDE
                    +'&type=person', anna.login, anna.password)
          .then(function (response) {
            var hrefs = [];
            assert.equal(response.statusCode, responseCodes.OK);
            response.body.results.forEach(function (item) {
              hrefs.push(item.href);
            });

            // LETS Lebbeke should be ABSENT
            expect(hrefs).not.to.contain(common.hrefs.PARTY_LETSLEBBEKE);
            // Steven Buytinck
            expect(hrefs).to.contain(common.hrefs.PARTY_STEVEN);
            // Anna
            expect(hrefs).to.contain('/parties/5df52f9f-e51f-4942-a810-1496c51e64db');
          });
      });

      it('should support ?forMessages=...', function () {
        return doGet(common.hrefs.PARTIES + '?forMessages=' +
                     common.hrefs.MESSAGE_LEEN_PLANTS, anna.login, anna.password)
          .then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.OK);
          assert.equal(response.body.results[0].href, common.hrefs.PARTY_LETSHAMME);
        });
      });

      it('should support ?inLatLong=...', function () {
        return doGet(common.hrefs.PARTIES + '?inLatLong=50.9,51.0,4.1,4.2', anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.OK);
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.PARTY_ANNA);
          expect(hrefs).to.contain(common.hrefs.PARTY_LETSDENDERMONDE);
          expect(hrefs).to.not.contain(common.hrefs.PARTY_LETSLEBBEKE);
          expect(hrefs).to.not.contain(common.hrefs.PARTY_LETSHAMME);
        });
      });
    });
    describe('PUT', function () {
      it('should allow insertion of new party.', function () {
        var body = {
          type: 'person',
          name: 'test user',
          status: 'active'
        };
        var uuid = common.generateUUID();
        debug('Generated UUID=' + uuid);
        return doPut(base + '/parties/' + uuid, body, 'annadv', 'test').then(
          function (response) {
            assert.equal(response.statusCode, 200);
            return doGet(base + '/parties/' + uuid, 'annadv', 'test').then(
              function (response2) {
                assert.equal(response2.statusCode, 200);
                var party = response2.body;
                assert.equal(party.type, 'person');
                assert.equal(party.name, 'test user');
                assert.equal(party.status, 'active');
              });
          });
      });

      it('should update party.', function () {
        return doGet(base + common.hrefs.PARTY_ANNA, 'annadv', 'test').then(function (response) {
          debug(response.body);
          var p = response.body;
          p.alias = 'myAlias';
          return doPut(base + common.hrefs.PARTY_ANNA, p, 'annadv', 'test');
        }).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, 200);
          return doGet(base + common.hrefs.PARTY_ANNA, 'annadv', 'test');
        }).then(function (response) {
          var party = response.body;
          assert.equal(party.alias, 'myAlias');
        });
      });
    });
  });
};
