
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
    PARTY_LETSDENDERMONDE: '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849',
    PARTY_LETSLEBBEKE: '/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5',
    PARTY_LETSHAMME: '/parties/0a98e68d-1fb9-4a31-a4e2-9289ee2dd301',

    PLUGIN_MAIL: '/plugins/7bd68a4b-138e-4228-9826-a002468222de',

    CONTACTDETAIL_ADDRESS_ANNA: '/contactdetails/843437b3-29dd-4704-afa8-6b06824b2e92',
    CONTACTDETAIL_EMAIL_ANNA: '/contactdetails/b059ef61-340c-45d8-be4f-02436bcc03d9',
    CONTACTDETAIL_ADDRESS_STEVEN: '/contactdetails/3266043e-c70d-4bb4-b0ee-6ff0ae42ce44',
    CONTACTDETAIL_EMAIL_STEVEN: '/contactdetails/77818c02-b15c-4304-9ac1-776dbb376770',
    CONTACTDETAIL_EMAIL_RUDI: '/contactdetails/351cbc67-fb30-4e2e-afd8-f02243148c26',
    CONTACTDETAIL_ADDRESS_LETSDENDERMONDE: '/contactdetails/96de9531-d777-4dca-9997-7a774d2d7595',
    CONTACTDETAIL_ADDRESS_MESSAGE: '/contactdetails/3362d325-cf19-4730-8490-583da50e114e',

    // LETS Dendermonde
    MESSAGE_RUDI_WEBSITE: '/messages/11f2229f-1dea-4c5a-8abe-2980b2812cc4',
    // LETS Lebbeke
    MESSAGE_ANNA_WINDOWS: '/messages/a998ff05-1291-4399-8604-16001015e147',
    MESSAGE_ANNA_CHUTNEY: '/messages/b7c41d85-687d-4f9e-a4ef-0c67515cbb63',
    MESSAGE_ANNA_VEGGIE_KOOKLES: '/messages/1f2e1d34-c3b7-42e8-9478-45cdc0839427',
    MESSAGE_ANNA_ASPERGES: '/messages/0cc3d15f-47ef-450a-a0ac-518202d7a67b',
    MESSAGE_STEVEN_INDISCH: '/messages/642f3d85-a21e-44d0-b6b3-969746feee9b',
    MESSAGE_STEVEN_SWITCH: '/messages/d1c23a0c-4420-4bd3-9fa0-d542b0155a15',
    // LETS Hamme
    MESSAGE_LEEN_PLANTS: '/messages/e24528a5-b12f-417a-a489-913d5879b895'
  }
};
