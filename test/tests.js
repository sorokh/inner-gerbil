/*eslint-env node, mocha */

var express = require('express');
//var compress = require('compression');
var pg = require('pg');
var assert = require('assert');
var expect = require('chai').expect;

var sri4node = require('sri4node');

var sriclient = require('sri4node-client');
var doGet = sriclient.get;
//var doPut = sriclient.put;
//var doDelete = sriclient.delete;

var common = require('./common.js');
console.log(common);
var createHrefArray = common.createHrefArray;

var verbose = true;

function debug(x) {
  'use strict';
  if (verbose) {
    console.log(x);
  }
}

var app = express();
var mapping = require('../js/config.js')(sri4node, verbose);
var port = 5000;
app.set('port', port);
sri4node.configure(app, pg, mapping);
var base = 'http://localhost:' + port;


app.listen(port, function () {
  'use strict';
  debug('Node app is running at localhost:' + port);
});

var getResultForHref = function (response, href) {
  'use strict';
  var index;
  for (index = 0; index < response.body.results.length; ++index) {
    if (response.body.results[index].href.valueOf() === href) {
      return response.body.results[index];
    }
  }
};

describe('/partyrelations', function () {
  'use strict';
  describe('GET', function () {
    it('should allow full list retrieval.', function () {
      var PARTY_HREF_DENDERMONDE = '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849';
      var PARTY_HREF_LEBBEKE = '/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5';
      var PARTY_HREF_ANNA = '/parties/5df52f9f-e51f-4942-a810-1496c51e64db';
      var PARTY_HREF_STEVEN = '/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504';

      return doGet(base + '/partyrelations').then(function (response) {
        assert.equal(response.statusCode, 200);
        if (response.body.$$meta.count < 3) {
          assert.fail('Expected all partyrelations');
        }
        var hrefs = createHrefArray(response);

        // LETS Lebbeke is a member of LETS Dendermonde
        expect(hrefs).to.contain('/partyrelations/cddffa35-6a2f-46c4-aa39-5b9040b4f429');
        var resultLebbekeDendermondeRelation = getResultForHref(response,
          '/partyrelations/cddffa35-6a2f-46c4-aa39-5b9040b4f429');
        expect(resultLebbekeDendermondeRelation).to.exist;
        assert.equal(resultLebbekeDendermondeRelation.$$expanded.from.href,
          PARTY_HREF_LEBBEKE);
        assert.equal(resultLebbekeDendermondeRelation.$$expanded.to.href,
          PARTY_HREF_DENDERMONDE);

        // Anna in LETS Lebbeke
        expect(hrefs).to.contain('/partyrelations/419e6446-9b3e-4e7d-9381-0c38af0b316a');
        var resultAnnaLebbekeRelation = getResultForHref(response,
          '/partyrelations/419e6446-9b3e-4e7d-9381-0c38af0b316a');
        expect(resultAnnaLebbekeRelation).to.exist;
        assert.equal(resultAnnaLebbekeRelation.$$expanded.from.href,
          PARTY_HREF_ANNA);
        assert.equal(resultAnnaLebbekeRelation.$$expanded.to.href,
          PARTY_HREF_LEBBEKE);

        // Steven in LETS Lebbeke
        expect(hrefs).to.contain('/partyrelations/db41c12a-a521-443a-97f1-f0e14658fb78');
        var resultStevenLebbekeRelation = getResultForHref(response,
          '/partyrelations/db41c12a-a521-443a-97f1-f0e14658fb78');
        expect(resultStevenLebbekeRelation).to.exist;
        assert.equal(resultStevenLebbekeRelation.$$expanded.from.href,
          PARTY_HREF_STEVEN);
        assert.equal(resultStevenLebbekeRelation.$$expanded.to.href,
          PARTY_HREF_LEBBEKE);
      });
    });
  });
});

describe('/messages', function () {
  'use strict';
  describe('GET', function () {
    it('should allow full list retrieval.', function () {
      return doGet(base + '/messages').then(function (response) {
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

require('./testTransactions.js')(base, verbose);
require('./testContactdetails.js')(base, verbose);
require('./testParties.js')(base, verbose);
