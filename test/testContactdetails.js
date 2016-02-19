var assert = require('assert');
var sriclient = require('sri4node-client');

var common = require('./common.js');
var createHrefArray = common.createHrefArray;
var expect = require('chai').expect;
var anna = common.accounts.ANNA;
var walter = common.accounts.WALTER;
var rudi = common.accounts.RUDY;
var leen = common.accounts.LEEN;
var steven = common.accounts.STEVEN;
var responseCodes = common.responses;

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

  describe('/contactdetails', function () {
    describe('GET', function () {
      it('should allow full list retrieval.', function () {
        return doGet(common.hrefs.CONTACTDETAILS, anna.login, anna.password).then(function (response) {
          assert.equal(response.statusCode, responseCodes.OK);
          if (response.body.$$meta.count < 3) {
            assert.fail('Expected all contactdetails');
          }
          var hrefs = createHrefArray(response);
          expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA);
          expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA);
          expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE);
        });
      });

      it('should support ?forMessages=', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forMessages=' +
                     '/messages/d1c23a0c-4420-4bd3-9fa0-d542b0155a15', 'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            assert.equal(response.body.results[0].href, '/contactdetails/3362d325-cf19-4730-8490-583da50e114e');
          });
      });

      it('should support ?forDescendantsOfParties=', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forDescendantsOfParties=' + common.hrefs.PARTY_LETSDENDERMONDE,
                    'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            var hrefs = createHrefArray(response);
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA); // address for anna
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA); // email anna
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_STEVEN); // address for steven
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_STEVEN); // email steven
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_RUDI); // email rudi
            // Only descendants, so not LETS_DENDERMONDE itself...
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE);
            // address for event. (non-party contactdetail)
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_MESSAGE);
          });
      });

      it('should support ?forDescendantsOfParties=', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forDescendantsOfParties=' + common.hrefs.PARTY_LETSLEBBEKE,
                    'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            var hrefs = createHrefArray(response);
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA); // address for anna
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA); // email anna
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_STEVEN); // address for steven
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_STEVEN); // email steven
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_RUDI); // email rudi
            // address LETS Dendermonde.
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE);
            // address for event. (non-party contactdetail)
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_MESSAGE);
          });
      });

      it('should support ?forPartiesReachableFromParties=', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forPartiesReachableFromParties=' + common.hrefs.PARTY_ANNA,
                    'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            var hrefs = createHrefArray(response);
            // No contactetails for Anna, as reachableFromParties excludes it's initial root (anna)
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA); // address for anna
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA); // email anna

            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_STEVEN); // address for steven
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_STEVEN); // email steven
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_RUDI); // email rudi
            // address LETS Dendermonde.
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE);

            // address for event. (non-party contactdetail)
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_MESSAGE);
          });
      });

      it('should support ?forAncestorsOfParties=', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forAncestorsOfParties=' + common.hrefs.PARTY_ANNA,
                    'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            var hrefs = createHrefArray(response);
            // No contactetails for Anna, as reachableFromParties excludes it's initial root (anna)
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA); // address for anna
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA); // email anna
            // No contact details of the other members of LETS Dendermonde
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_STEVEN); // address for steven
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_STEVEN); // email steven
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_RUDI); // email rudi

            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE); // address LETS Dendermonde.

            // address for event. (non-party contactdetail)
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_MESSAGE);
          });
      });

      it('should support ?forParentsOfParties=x,y,z', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forParentsOfParties=' + common.hrefs.PARTY_ANNA,
                    'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            var hrefs = createHrefArray(response);
            // No contactetails for Anna
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA); // address for anna
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA); // email anna
            // No contact details of the other members of LETS Dendermonde
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_STEVEN); // address for steven
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_STEVEN); // email steven
            // Rudi is a direct member of LETS Dendermonde
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_RUDI); // email rudi
            // No contact details of parent-of-parent: LETS Dendermonde.
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE);
            // address for event. (non-party contactdetail)
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_MESSAGE);
          });
      });

      it('should support ?forParentsOfParties=x,y,z', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forParentsOfParties=' + common.hrefs.PARTY_LETSLEBBEKE,
                    'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            var hrefs = createHrefArray(response);
            // No contactetails for Anna
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA); // address for anna
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA); // email anna
            // No contact details of the other members of LETS Dendermonde
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_STEVEN); // address for steven
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_STEVEN); // email steven
            // Rudi is a direct member of LETS Dendermonde.
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_RUDI); // email rudi
            // SHould have address for LETS Dendermonde.
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE); // address LETS Dendermonde.
            // address for event. (non-party contactdetail)
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_MESSAGE);
          });
      });

      it('should support ?forChildrenOfParties=x,y,z', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forChildrenOfParties=' + common.hrefs.PARTY_LETSLEBBEKE,
                    'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            var hrefs = createHrefArray(response);
            // All contactdetails for direct children : anna, steven & rudi.
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA); // address for anna
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA); // email anna
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_ADDRESS_STEVEN); // address for steven
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_STEVEN); // email steven
            // Rudi is direct member of LETS Dendermonde
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_RUDI); // email rudi
            // No parents, obviously : address LETS Dendermonde.
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE);
            // No event contactdetails, obviously
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_MESSAGE);
          });
      });

      it('should support ?forChildrenOfParties=x,y,z', function () {
        return doGet(common.hrefs.CONTACTDETAILS + '?forChildrenOfParties=' + common.hrefs.PARTY_LETSDENDERMONDE,
                    'annadv', 'test')
          .then(function (response) {
            debug(response.body);
            assert.equal(response.statusCode, responseCodes.OK);
            var hrefs = createHrefArray(response);
            // No contactetails for indirect children of LETS Dendermonde
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_ANNA); // address for anna
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_ANNA); // email anna
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_STEVEN); // address for steven
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_EMAIL_STEVEN); // email steven
            // Rudi is a direct member of LETS Dendermonde, so expect his details.
            expect(hrefs).to.contain(common.hrefs.CONTACTDETAIL_EMAIL_RUDI); // email rudi
            // No contact details of LETS Dendermonde itself.
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_LETSDENDERMONDE);
            // No contact details of messages.
            expect(hrefs).to.not.contain(common.hrefs.CONTACTDETAIL_ADDRESS_MESSAGE);
          });
      });
    });

    describe('PUT', function () {
      it('should allow creating a contactactdetail for self', function (done) {
        var uuid = common.generateUUID();
        common.cl(uuid);
        debug('Generated UUID=' + uuid);
        var body = [
          {
            href: '/contactdetails/' + uuid,
            verb: 'PUT',
            body: {
              type: 'email',
              value: 'test@tester.com',
              public: true
            }
          },
          {
            href: '/partycontactdetails/' + common.generateUUID(),
            verb: 'PUT',
            body: {
              party: {
                href: common.hrefs.PARTY_STEVEN
              },
              contactdetail: {
                href: '/contactdetails/' + uuid
              }
            }
          }
        ];
        doPut(common.hrefs.BATCH, body, steven.login, steven.password).then(
          function (response) {
            assert.equal(response.statusCode, common.responses.CREATED);
            return doGet(common.hrefs.CONTACTDETAILS + '/' + uuid, steven.login, steven.password).then(
              function (responseGet) {
                assert.equal(responseGet.statusCode, common.responses.OK);
                var contactdetail = responseGet.body;
                assert.equal(contactdetail.type, 'email');
                assert.equal(contactdetail.value, 'test@tester.com');
                assert.equal(contactdetail.$$parties[0].href, common.hrefs.PARTY_STEVEN);
                done();
              }, done).done();
          });
      });

      it('should allow creating a contactdetail for other with appropriate admin rights',
        function (done) {
          var uuid = common.generateUUID();
          common.cl(uuid);
          debug('Generated UUID=' + uuid);
          var body = [
            {
              href: '/contactdetails/' + uuid,
              verb: 'PUT',
              body: {
                type: 'email',
                value: 'test@tester.com',
                public: true
              }
            },
            {
              href: '/partycontactdetails/' + common.generateUUID(),
              verb: 'PUT',
              body: {
                party: {
                  href: common.hrefs.PARTY_STEVEN
                },
                contactdetail: {
                  href: '/contactdetails/' + uuid
                }
              }
            }
          ];
          doPut(common.hrefs.BATCH, body, anna.login, anna.password).then(
            function (response) {
              assert.equal(response.statusCode, common.responses.CREATED);
              return doGet(common.hrefs.CONTACTDETAILS + '/' + uuid, anna.login, anna.password).then(
                function (responseGet) {
                  assert.equal(responseGet.statusCode, common.responses.OK);
                  var contactdetail = responseGet.body;
                  assert.equal(contactdetail.type, 'email');
                  assert.equal(contactdetail.value, 'test@tester.com');
                  assert.equal(contactdetail.$$parties[0].href, common.hrefs.PARTY_STEVEN);
                  done();
                }, done).done();
            });
        });
      it('should disallow creating a contactdetail for other without appropriate admin rights',
        function (done) {
          var uuid = common.generateUUID();
          common.cl(uuid);
          debug('Generated UUID=' + uuid);
          var body = [
            {
              href: '/contactdetails/' + uuid,
              verb: 'PUT',
              body: {
                type: 'email',
                value: 'test@tester.com',
                public: true
              }
            },
            {
              href: '/partycontactdetails/' + common.generateUUID(),
              verb: 'PUT',
              body: {
                party: {
                  href: common.hrefs.PARTY_STEVEN
                },
                contactdetail: {
                  href: '/contactdetails/' + uuid
                }
              }
            }
          ];
          doPut(common.hrefs.BATCH, body, leen.login, leen.password).then(
            function (response) {
              assert.equal(response.statusCode, common.responses.FORBIDDEN);
              done();
            }).done();
        });
      it('should allow updating a contactactdetail for self',
      function (done) {
        var uuid = common.generateUUID();
        common.cl(uuid);
        debug('Generated UUID=' + uuid);
        var body =
          {
            type: 'email',
            value: 'test@tester.com',
            public: true
          };
        doPut(common.hrefs.CONTACTDETAIL_EMAIL_ANNA, body, anna.login, anna.password).then(
          function (response) {
            assert.equal(response.statusCode, common.responses.OK);
            done();
          }).done();
      });
      it('should allow updating a contactdetail for other with appropriate admin rights');
      it('should disallow updating a contactdetail for other without appropriate admin rights',
      function (done) {
        var body =
          {
            type: 'email',
            value: 'test@tester.com',
            public: true
          };
        doPut(common.hrefs.CONTACTDETAIL_EMAIL_ANNA, body, leen.login, leen.password).then(
          function (response) {
            assert.equal(response.statusCode, common.responses.FORBIDDEN);
            done();
          }).done();
      });
      it('should allow updating orphaned contactdetail with appropriate admin rights');
      it('should disallow updating orphaned contactdetail without appropriate admin rights');
    });
    describe('DELETE', function () {
      it('should allow deleting own contactdetail');
      it('should allow deleting other contactdetail with appropriate admin rights');
      it('should disallow deleting other contactdetail without appropriate admin rights');
    });
  });
};
