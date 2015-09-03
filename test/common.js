
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
  },

  hrefs: {
    PARTY_DENDERMONDE: '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849',
    PARTY_LEBBEKE: '/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5',
    PLUGIN_MAIL: '/plugins/7bd68a4b-138e-4228-9826-a002468222de'
  }
};
