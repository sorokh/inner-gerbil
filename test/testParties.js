var assert = require('assert');
var async = require('async');
var sriclient = require('sri4node-client');
var common = require('./common.js');
var bcrypt = require('bcrypt');
var createHrefArray = common.createHrefArray;
var expect = require('chai').expect;
var anna = common.accounts.ANNA;
var walter = common.accounts.WALTER;
var rudi = common.accounts.RUDY;
var leen = common.accounts.LEEN;
var steven = common.accounts.STEVEN;
var responseCodes = common.responses;



exports = module.exports = function (base, sri4node, logverbose) {
  'use strict';

  var doGet = common.doGet(base);
  var doPut = common.doPut(base);
  var doDelete = common.doDelete(base);


  var entityStore = [];

  function generateRandomPerson() {

    return {
      type: "person",
      name: common.randomString(10),
      alias: common.randomString(6),
      dateofbirth: new Date("01/12/1969").toJSON(),
      imageurl: "http://imagesource.net/az453SDF.png",
      login: common.randomString(6),
      password: common.randomString(16),
      status: "active"
    };
  }

  function generateRandomGroup( type ) {
    return {
      type: type,
      name: common.randomString(10),
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
            it('should allow the retrieval of a party.', function () {
                return doGet(common.hrefs.PARTY_ANNA, anna.login, anna.password).then(function (response) {
                    debug(response.body);
                    assert.equal(response.statusCode, responseCodes.OK);
                    assert.equal(response.body.$$meta.permalink, common.hrefs.PARTY_ANNA);
                });
            });
            it('should fail on the retrieval of a non existing party', function () {
                return doGet(common.hrefs.PARTY_DUMMY, anna.login, anna.password).then(function (response){
                    debug(response.body);
                    assert.equal(response.statusCode, responseCodes.NOT_FOUND);
                });
            });
        });
    });
  describe('/parties/{party_id} for "persons"', function () {
      describe('DELETE', function () {
          var testReferenceParty = generateRandomPerson();
          var testReferencePartyLink = common.hrefs.PARTIES + '/' + common.generateUUID();
          beforeEach('creating test record', function (done) {
              doPut(testReferencePartyLink, testReferenceParty, anna.login, anna.password)
                  .then(function (resp) { done(); }, done).done();
          });
          afterEach('cleanup', function (done) {
              doDelete(testReferencePartyLink, testReferenceParty.login, testReferenceParty.password)
                  .then(function (resp) {done(); }, done).done();
          });
          it('must be able to delete my person', function (done) {
             doDelete(testReferencePartyLink, testReferenceParty.login, testReferenceParty.password)
                 .then(function (resp) {
                     assert.equal(resp.statusCode, responseCodes.OK);
                     done();
                 }, done).done();
          });
          it('must not be able to delete other persons', function (done) {
              doDelete(testReferencePartyLink, anna.login, anna.password)
                  .then(function (resp) {
                      assert.equal(resp.statusCode, responseCodes.FORBIDDEN);
                      done();
                  }, done).done();
          });
      });
    describe('PUT', function () {
      var testReferenceParty = generateRandomPerson();
      var testReferencePartyLink = common.hrefs.PARTIES + '/' + common.generateUUID();

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
        doPut(testReferencePartyLink, testReferenceParty, anna.login, anna.password)
            .then(function (resp) { done(); }, done);
      });

      after(function (done) {
        doDelete(testReferencePartyLink, testReferenceParty.login, testReferenceParty.password)
            .then(function (resp) {done(); }, done).done();
      });

      it('should allow the creation of a person', function () {
        var testPartyPermaLink = common.hrefs.PARTIES + '/' + common.generateUUID();
        var testPerson = generateRandomPerson();
        entityStore.push({permalink: testPartyPermaLink, login: testPerson.login, password: testPerson.password});
        return doPut(testPartyPermaLink, testPerson, anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.CREATED);
        });
      });
      it('should disallow the creation of duplicates (login,alias)', function (done) {
        var testPartyPermaLink = common.hrefs.PARTIES + '/' + common.generateUUID();
        entityStore.push({permalink: testPartyPermaLink, login: testReferenceParty.login, password: testReferenceParty.password});
        return doPut(testPartyPermaLink, testReferenceParty, anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.CONFLICT);
          done();
        }).done();
      });
      it('should allow the creation of persons with the same personal data (name,surname,birthday)', function () {
          var testPartyPermaLink2;
          var testPartyPermaLink;
          var testPerson1, testPerson2;
          testPartyPermaLink = common.hrefs.PARTIES + '/' + common.generateUUID();
          testPerson1 = generateRandomPerson();
          entityStore.push({permalink: testPartyPermaLink, login: testPerson1.login, password: testPerson1.password});
          testPartyPermaLink2 = common.hrefs.PARTIES + '/' + common.generateUUID();
          testPerson2 = generateRandomPerson();
          testPerson2.name = testPerson1.name;
          testPerson2.dateofbirth = testPerson1.dateofbirth;
          testPerson2.alias = testPerson1.alias;
        entityStore.push({permalink: testPartyPermaLink2, login: testPerson2.login, password: testPerson2.password});
        return doPut(testPartyPermaLink, testPerson1, anna.login, anna.password).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.CREATED);
          doPut(testPartyPermaLink2, testPerson2, anna.login, anna.password).then(function (resp) {
            debug(resp.body);
            assert.equal(resp.statusCode, responseCodes.CREATED);
          });
        });
      });
      it('should allow the update of a person, if you have sufficient rights to do so.',function (done) {

          var testPartyUpdate = {};
          testPartyUpdate.alias = 'anonymous';
          testPartyUpdate.name = testReferenceParty.name;
          testPartyUpdate.status = testReferenceParty.status;
          testPartyUpdate.type = testReferenceParty.type;

          return doPut(testReferencePartyLink, testPartyUpdate, testReferenceParty.login, testReferenceParty.password)
              .then(
                  function (resp) {
                      assert.equal(resp.statusCode, responseCodes.OK);
                      doGet(testReferencePartyLink, testReferenceParty.login, testReferenceParty.password)
                          .then(
                              function (resp2) {
                                  assert.equal(resp2.statusCode, responseCodes.OK);
                                  assert.equal(resp2.body.alias, testPartyUpdate.alias);
                                  done();
                              }, done).done();
                  }, done);
      });
      it('should disallow the update of a person, if it\'s not yourself or you don\'t have sufficient' +
          ' administrative rights',
          function (done){
              var testPartyUpdate={};
              testPartyUpdate.alias = "anonymous";
              testPartyUpdate.name = testReferenceParty.name;
              testPartyUpdate.status = testReferenceParty.status;
              testPartyUpdate.type = testReferenceParty.type;
              return doPut(testReferencePartyLink, testPartyUpdate, anna.login, anna.password)
                  .then(
                      function (resp) {
                          assert.equal(resp.statusCode, responseCodes.FORBIDDEN);
                          done();
                      },
                      done
                  );
          }
      );
    });
  });
    describe('parties/{party_id} for groups', function () {
        var testReferenceGroup = generateRandomGroup('group');
        var testReferenceGroupLink = common.hrefs.PARTIES + '/' + common.generateUUID();
        var testReferenceSubGroup = generateRandomGroup('subgroup');
        var testReferenceSubGroupLink = common.hrefs.PARTIES + '/' + common.generateUUID();
        var testRelationLink = common.hrefs.PARTYRELATIONS + '/' + common.generateUUID();
        var testRelation = {
            from: {href: testReferenceSubGroupLink},
            to: { href: testReferenceGroupLink},
            type: 'member',
            status: 'active',
            balance: '0'
        };

        afterEach('cleanup test created data', function (cleanupDone) {
            async.each(entityStore, function (entity, callback) {
                debug(entity);
                doDelete(entity.permalink, entity.login, entity.password).then(
                    function (response) {
                        debug(response);
                        if(response.statusCode === responseCodes.OK || response.statusCode === responseCodes.GONE) {
                            entityStore = entityStore.filter(function (e) {
                                return e !== entity;
                            });
                            callback();
                        } else {
                            callback(response.statusCode);
                        }
                    }).done();
            }, function (err) {
                cleanupDone(); });
        });

        describe('GET', function () {
          it('should allow the retrieval of a group.', function () {
              doGet(testReferenceGroupLink, anna.login, anna.password).then(
                  function (resp) {
                      assert.equal(resp.statusCode, responseCodes.OK);
                      assert.equal(resp.body.name, testReferenceGroup.name);
                      assert.equal(resp.body.currencyname, testReferenceGroup.currencyname);
                  });
          });
        });
        describe('PUT', function () {
            it('should allow the creation of a group', function (done) {
                var newgroup = generateRandomGroup('group');
                var newgroupLink = common.hrefs.PARTIES + '/' + common.generateUUID();
                entityStore.push({
                    permalink: newgroupLink,
                    login: anna.login,
                    password: anna.password
                });
                doPut(newgroupLink, newgroup, anna.login, anna.password).then(
                    function (resp) {
                        debug (resp);
                        assert.equal(resp.statusCode, responseCodes.CREATED);
                        doGet(newgroupLink, anna.login, anna.password).then(
                            function (resp2) {
                                debug(resp2);
                                assert.equal(resp2.statusCode, responseCodes.OK);
                                assert.equal(resp2.body.name, newgroup.name);
                                done();
                        });
                    }).done();
            });
            it('should allow the creation of a subgroup',function(done) {
                //TODO: verify if this is ok? Ideally a subgroup can only be created in a batch with the creation of
                // its parent child relation.

                var newgroup = generateRandomGroup('subgroup');
                var newgroupLink = common.hrefs.PARTIES + '/' + common.generateUUID();
                entityStore.push({
                    permalink: newgroupLink,
                    login: anna.login,
                    password: anna.password
                });
                doPut(newgroupLink, newgroup, anna.login, anna.password).then(
                    function (resp) {
                        debug (resp);
                        assert.equal(resp.statusCode, responseCodes.CREATED);
                        doGet(newgroupLink, anna.login, anna.password).then(
                            function (resp2) {
                                debug(resp2);
                                assert.equal(resp2.statusCode, responseCodes.OK);
                                assert.equal(resp2.body.name, newgroup.name);
                                done();
                            });
                    }).done();
            });
            it('should disallow the creation of a group with duplicate name ', function (done) {
                var duplicategroup = generateRandomGroup('group');
                duplicategroup.name = 'LETS Regio Dendermonde';
                var duplicategroupLink = common.hrefs.PARTIES + '/' + common.generateUUID();
                doPut(duplicategroupLink, duplicategroup, anna.login, anna.password).then(
                    function (resp) {
                       debug (resp);
                        assert.equal(resp.statusCode, responseCodes.CONFLICT);
                        done();
                    }).done();
            });
            it('should disallow the creation of a subgroup with duplicate name ', function (done) {
                var duplicategroup = generateRandomGroup('subgroup');
                duplicategroup.name = 'LETS Lebbeke';
                var duplicategroupLink = common.hrefs.PARTIES + '/' + common.generateUUID();
                doPut(duplicategroupLink, duplicategroup, anna.login, anna.password).then(
                    function (resp) {
                        debug (resp);
                        assert.equal(resp.statusCode, responseCodes.CONFLICT);
                        done();
                    }).done();
            });
            it('should disallow the creation of a subgroup with duplicate groupname ', function (done) {
                var duplicategroup = generateRandomGroup('subgroup');
                duplicategroup.name = 'LETS Regio Dendermonde';
                var duplicategroupLink = common.hrefs.PARTIES + '/' + common.generateUUID();
                doPut(duplicategroupLink, duplicategroup, anna.login, anna.password).then(
                    function (resp) {
                        debug (resp);
                        assert.equal(resp.statusCode, responseCodes.CONFLICT);
                        done();
                    }).done();
            });
            it('should disallow the creation of a group with duplicate subgroupname ', function (done) {
                var duplicategroup = generateRandomGroup('group');
                duplicategroup.name = 'LETS Lebbeke';
                var duplicategroupLink = common.hrefs.PARTIES + '/' + common.generateUUID();
                doPut(duplicategroupLink, duplicategroup, anna.login, anna.password).then(
                    function (resp) {
                        debug (resp);
                        assert.equal(resp.statusCode, responseCodes.CONFLICT);
                        done();
                    }).done();
            });
            it('should allow the update of a group by a group admin', function(done) {
                doGet(common.hrefs.PARTY_LETSDENDERMONDE, anna.login, anna.password).then(
                    function (resp) {
                        assert.equal(resp.statusCode, responseCodes.OK);
                        var dendermonde = resp.body;
                        dendermonde.alias = 'Dendermonde';
                        doPut(dendermonde.$$meta.permalink, dendermonde, walter.login, walter.password).then(
                            function (resp2) {
                                assert.equal(resp2.statusCode, responseCodes.OK);
                                done();
                            }
                        ).done();
                    });
            });
            it('should allow the update of a subgroup, by a subgroup admin', function(done) {
                doGet(common.hrefs.PARTY_LETSLEBBEKE, anna.login, anna.password).then(
                    function (resp) {
                        assert.equal(resp.statusCode, responseCodes.OK);
                        var lebbeke = resp.body;
                        lebbeke.alias = 'Lebbeke';
                        doPut(lebbeke.$$meta.permalink, lebbeke, anna.login, anna.password).then(
                            function (resp2) {
                                assert.equal(resp2.statusCode, responseCodes.OK);
                                done();
                            }
                        ).done();
                    });
            });
            it('shoud disallow the update of a group by a subgroup admin', function(done) {
                doGet(common.hrefs.PARTY_LETSDENDERMONDE, anna.login, anna.password).then(
                    function (resp) {
                        assert.equal(resp.statusCode, responseCodes.OK);
                        var dendermonde = resp.body;
                        dendermonde.alias = 'Dendermonde';
                        doPut(dendermonde.$$meta.permalink, dendermonde, anna.login, anna.password).then(
                            function (resp2) {
                                assert.equal(resp2.statusCode, responseCodes.FORBIDDEN);
                                done();
                            }
                        ).done();
                    });
            });
            it('shoud disallow the update of a group by a regular member', function(done) {
                doGet(common.hrefs.PARTY_LETSDENDERMONDE, anna.login, anna.password).then(
                    function (resp) {
                        assert.equal(resp.statusCode, responseCodes.OK);
                        var dendermonde = resp.body;
                        dendermonde.alias = 'Dendermonde';
                        //TODO replace by a true member of Dendermonde.
                        doPut(dendermonde.$$meta.permalink, dendermonde, steven.login, steven.password).then(
                            function (resp2) {
                                assert.equal(resp2.statusCode, responseCodes.FORBIDDEN);
                                done();
                            }
                        ).done();
                    });
            });
            it('shoud disallow the update of a subgroup, by a parent group admin.', function(done) {
                doGet(common.hrefs.PARTY_LETSLEBBEKE, anna.login, anna.password).then(
                    function (resp) {
                        assert.equal(resp.statusCode, responseCodes.OK);
                        var lebbeke = resp.body;
                        lebbeke.alias = 'Lebbeke';
                        doPut(lebbeke.$$meta.permalink, lebbeke, walter.login, walter.password).then(
                            function (resp2) {
                                assert.equal(resp2.statusCode, responseCodes.FORBIDDEN);
                                done();
                            }
                        ).done();
                    });
            });
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
        return doGet(common.hrefs.PARTIES + '?ancestorsOfParties=' +
                     common.hrefs.PARTY_LETSLEBBEKE, anna.login, anna.password)
          .then(function (response) {
            assert.equal(response.statusCode, responseCodes.OK);
            assert.equal(response.body.$$meta.count, 1);
            assert.equal(response.body.results[0].href, '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849');
          });
      });

      it('should support ancestorsOfParties with multiple parameters', function () {
        return doGet(common.hrefs.PARTIES + '?ancestorsOfParties=' +
                common.hrefs.PARTY_ANNA + ',' + common.hrefs.PARTY_STEVEN,
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
            hrefs = common.createHrefArray(response);

            // LETS Dendermonde
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSDENDERMONDE);
            // LETS Lebbeke
            expect(hrefs).to.contain(common.hrefs.PARTY_LETSLEBBEKE);
              //Self is not included in result!
            // Steven Buytinck
            expect(hrefs).to.not.contain(common.hrefs.PARTY_STEVEN);
            // Anna
            expect(hrefs).to.not.contain(common.hrefs.PARTY_ANNA);
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
            expect(hrefs).to.contain(common.hrefs.PARTY_ANNA);
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
      it('should update party.', function () {
        return doGet(common.hrefs.PARTY_ANNA, anna.login, anna.password).then(function (response) {
          debug(response.body);
          var p = response.body;
          p.alias = 'myAlias';
          return doPut(common.hrefs.PARTY_ANNA, p, anna.login, anna.password);
        }).then(function (response) {
          debug(response.body);
          assert.equal(response.statusCode, responseCodes.OK);
          return doGet(common.hrefs.PARTY_ANNA, anna.login, anna.password);
        }).then(function (response) {
          var party = response.body;
          assert.equal(party.alias, 'myAlias');
        });
      });
    });
  });
};
