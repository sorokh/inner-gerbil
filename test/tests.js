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

describe('/parties', function () {
  'use strict';
  describe('GET', function () {
    it('should allow full list retrieval.', function () {
      return doGet(base + '/parties').then(function (response) {
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
  });
});
var createHrefArray = function (response) {
  'use strict';
  var hrefs = [];
  response.body.results.forEach(function (item) {
    hrefs.push(item.href);
  });
  return hrefs;
};

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
          '/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5');
        assert.equal(resultLebbekeDendermondeRelation.$$expanded.to.href,
          '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849');

        // Anna in LETS Lebbeke
        expect(hrefs).to.contain('/partyrelations/419e6446-9b3e-4e7d-9381-0c38af0b316a');
        var resultAnnaLebbekeRelation = getResultForHref(response,
          '/partyrelations/419e6446-9b3e-4e7d-9381-0c38af0b316a');
        expect(resultAnnaLebbekeRelation).to.exist;
        assert.equal(resultAnnaLebbekeRelation.$$expanded.from.href,
          '/parties/5df52f9f-e51f-4942-a810-1496c51e64db');
        assert.equal(resultAnnaLebbekeRelation.$$expanded.to.href,
          '/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5');

        // Steven in LETS Lebbeke
        expect(hrefs).to.contain('/partyrelations/db41c12a-a521-443a-97f1-f0e14658fb78');
        var resultStevenLebbekeRelation = getResultForHref(response,
          '/partyrelations/db41c12a-a521-443a-97f1-f0e14658fb78');
        expect(resultStevenLebbekeRelation).to.exist;
        assert.equal(resultStevenLebbekeRelation.$$expanded.from.href,
          '/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504');
        assert.equal(resultStevenLebbekeRelation.$$expanded.to.href,
          '/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5');
      });
    });
  });
});

describe('/transactions', function () {
  'use strict';
  describe('GET', function () {
    it('should allow full list retrieval.', function () {
      return doGet(base + '/transactions').then(function (response) {
        assert.equal(response.statusCode, 200);
        // TODO: add more transactions to test data
        if (response.body.$$meta.count < 1) {
          assert.fail('Expected all transactions');
        }
        var hrefs = createHrefArray(response);
        expect(hrefs).to.contain('/transactions/e068c284-26f1-4d11-acf3-8942610b26e7');
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
