
exports = module.exports = {
  createHrefArray: function (response) {
    'use strict';
    var hrefs = [];
    response.body.results.forEach(function (item) {
      hrefs.push(item.href);
    });
    return hrefs;
  },

  getResultForHref: function (response, href) {
    'use strict';
    var index;
    for (index = 0; index < response.body.results.length; ++index) {
      if (response.body.results[index].href.valueOf() === href) {
        return response.body.results[index];
      }
    }
  },

  cl: function (x) {
    'use strict';
    console.log(x); // eslint-disable-line
  }
};
