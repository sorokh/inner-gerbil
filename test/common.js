var sriclient = require('sri4node-client');
var uuid = require('uuid');

exports = module.exports = {
  createHrefArray: function (response) {
    'use strict';
    var hrefs = [];
    response.body.results.forEach(function (item) {
      hrefs.push(item.href);
    });
    return hrefs;
  },

  doGet: function (base) {
    'use strict';
    return function (path, user, password) {
      return sriclient.get(base + path, user, password);
    };
  },

  doPut: function (base) {
    'use strict';
    return function (path, body, user, password) {
      return sriclient.put(base + path, body, user, password);
    };
  },

  doDelete: function (base) {
    'use strict';
    return function (path, user, password) {
      return sriclient.delete(base + path, user, password);
    };
  },

  getResultForHref: function (response, href) {
    'use strict';
    var index;
    for (index = 0; index < response.body.results.length; ++index) {
      if (response.body.results[index].href.valueOf() === href) {
        return response.body.results[index];
      }
    }
    return null;
  },

  cl: function (x) {
    'use strict';
    console.log(x); // eslint-disable-line
  },

  generateUUID: function () {
    'use strict';
    return uuid.v4();
  },

  randomString: function (strLength, charSet) {
    'use strict';
    var result = [];

    strLength = strLength || 5;
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789éèçàùëäüï$!?-&@';

    while (--strLength) {
      result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    }

    return result.join('');
  },
  
  randomHTMLString: function (strLength, elementSet){
   var returnValue = '';
    elementSet = elementSet || { 
      allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                     'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                     'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre' ],
      allowedAttributes: {
          a: [ 'href', 'name', 'target' ],
          img: [ 'src' ]
      },
      // Lots of these won't come up by default because we don't allow them
      selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
      // URL schemes we permit
      allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
      allowedSchemesByTag: {}
    };
    if(strLength <7){
      returnValue = randomString(strLength);
    } else {
      if(strLength<9){
        returnValue = '<p>'+randomString(strLength-6)+'</p>';
      }else if (strLength<16){
        returnValue = '<h1>'+randomString(strLength-8)+'</h1>';
      } else {
        var headerlength = Math.round((strLength-16)/2);
        returnValue = '<h1>'+ this.randomString(headerlength) + '</h1><p>' + this.randomString(strLength-16 -headerlength) + '</p>';
      }
    }
    return returnValue;
  },

  accounts: {
    RUUD: {
      login: 'ruudme',
      password: 'test'
    },
    ANNA: {
      login: 'annadv',
      password: 'test'
    },
    STEVEN: {
      login: 'stevenb',
      password: 'test'
    },
    EDDY: {
      login: 'eddym',
      password: 'test'
    },
    EMMANUELLA: {
      login: 'emmanuella',
      password: 'test'
    },
    WALTER: {
      login: 'waltervh',
      password: 'test'
    },
    RUDY: {
      login: 'rudir',
      password: 'test'
    },
    LEEN: {
      login: 'leendb',
      password: 'test'
    },
    DUMMY: {
      login: 'fake',
      passwork: ''
    }
  },

  hrefs: {
    PARTIES: '/parties',
    BATCH: '/batch',
    PARTYRELATIONS: '/partyrelations',

    PARTY_LETSDENDERMONDE: '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849',
    PARTY_LETSLEBBEKE: '/parties/aca5e15d-9f4c-4c79-b906-f7e868b3abc5',
    PARTY_LETSHAMME: '/parties/0a98e68d-1fb9-4a31-a4e2-9289ee2dd301',

    PARTY_ANNA: '/parties/5df52f9f-e51f-4942-a810-1496c51e64db',
    PARTY_STEVEN: '/parties/fa17e7f5-ade9-49d4-abf3-dc3722711504',
    PARTY_RUDI: '/parties/eb6e3ad7-066f-4357-a582-dfb31e173606',
    PARTY_EDDY: '/parties/437d9b64-a3b4-467c-9abe-e9410332c1e5',
    PARTY_LEEN: '/parties/abcb3c6e-721e-4f7c-ae4a-935e1980f15e',
    PARTY_EMMANUELLA: '/parties/508f9ec9-df73-4a55-ad42-32839abd1760',
    PARTY_DUMMY: '/parties/00000000-0000-0000-0000-000000000000',
    PARTY_WALTER: '/parties/80af7e3f-b549-4774-832d-6d6243ff348f',

    PLUGIN_MAIL: '/plugins/7bd68a4b-138e-4228-9826-a002468222de',

    CONTACTDETAILS: '/contactdetails',
    CONTACTDETAIL_ADDRESS_ANNA: '/contactdetails/843437b3-29dd-4704-afa8-6b06824b2e92',
    CONTACTDETAIL_EMAIL_ANNA: '/contactdetails/b059ef61-340c-45d8-be4f-02436bcc03d9',
    CONTACTDETAIL_ADDRESS_STEVEN: '/contactdetails/3266043e-c70d-4bb4-b0ee-6ff0ae42ce44',
    CONTACTDETAIL_EMAIL_STEVEN: '/contactdetails/77818c02-b15c-4304-9ac1-776dbb376770',
    CONTACTDETAIL_EMAIL_RUDI: '/contactdetails/351cbc67-fb30-4e2e-afd8-f02243148c26',
    CONTACTDETAIL_ADDRESS_LETSDENDERMONDE: '/contactdetails/96de9531-d777-4dca-9997-7a774d2d7595',
    CONTACTDETAIL_ADDRESS_MESSAGE: '/contactdetails/3362d325-cf19-4730-8490-583da50e114e',

    MESSAGES: '/messages',
    // LETS Dendermonde
    MESSAGE_RUDI_WEBSITE: '/messages/11f2229f-1dea-4c5a-8abe-2980b2812cc4',
    // LETS Lebbeke
    MESSAGE_ANNA_WINDOWS: '/messages/a998ff05-1291-4399-8604-16001015e147',
    MESSAGE_ANNA_CHUTNEY: '/messages/b7c41d85-687d-4f9e-a4ef-0c67515cbb63',
    MESSAGE_ANNA_VEGGIE_KOOKLES: '/messages/1f2e1d34-c3b7-42e8-9478-45cdc0839427',
    MESSAGE_ANNA_ASPERGES: '/messages/0cc3d15f-47ef-450a-a0ac-518202d7a67b',
    MESSAGE_STEVEN_INDISCH: '/messages/642f3d85-a21e-44d0-b6b3-969746feee9b',
    MESSAGE_STEVEN_SWITCH: '/messages/d1c23a0c-4420-4bd3-9fa0-d542b0155a15',
    MESSAGE_STEVEN_REPLY_TO_ASPERGES: '/messages/e8a73a40-bfcd-4f5a-9f8a-9355cc956af0',
    // LETS Hamme
    MESSAGE_LEEN_PLANTS: '/messages/e24528a5-b12f-417a-a489-913d5879b895',
    
    MESSAGE_RELATIONS: '/messagerelations',
    MESSAGE_RELATION_ASPERGES: '/messagerelations/cc03a9d4-1aef-4c8f-9b05-7b39be514a67',
    
    MESSAGE_PARTIES: '/messageparties',
    
    TRANSACTIONS: '/transactions',
    TRANSACTION_ANNA_STEVEN_20: '/transactions/e068c284-26f1-4d11-acf3-8942610b26e7',
    TRANSACTION_LEEN_EMMANUELLA_20: '/transactions/1ffc9267-b51f-4970-91a2-ae20f4487f78'
  },

  responses: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    GONE: 410
  }
};
