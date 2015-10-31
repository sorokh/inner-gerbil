var common = require('./common.js');

exports = module.exports = function (sri4node, extra) {
  'use strict';
  var $u = sri4node.utils,
    $m = sri4node.mapUtils,
    $s = sri4node.schemaUtils,
    $q = sri4node.queryUtils;

  function forDescendantsOfParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    common.descendantsOfParties($u, value, select, 'descendantsOfParties');
    select.sql(' and key in ' +
               '(select contactdetail from partycontactdetails where party in ' +
               '(select key from descendantsOfParties where key not in (').array(keys).sql('))) ');
  }

  function forPartiesReachableFromParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    common.reachableFromParties($u, value, select, 'partiesReachableFromParties');
    select.sql(' and key in ' +
               '(select contactdetail from partycontactdetails where party in ' +
               '(select key from partiesReachableFromParties where key not in (').array(keys).sql('))) ');
  }

  function forAncestorsOfParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    common.ancestorsOfParties($u, value, select, 'ancestorsOfParties');
    select.sql(' and key in ' +
               '(select contactdetail from partycontactdetails where party in ' +
               '(select key from ancestorsOfParties where key not in (').array(keys).sql('))) ');
  }

  function forParentsOfParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    select.sql(' and "key" in ' +
               '(select "contactdetail" from partycontactdetails where "party" in ' +
               '(select "to" from partyrelations where "from" in (').array(keys).sql(') and "type" = \'member\')) ');
  }

  function forChildrenOfParties(value, select) {
    var keys = common.uuidsFromCommaSeparatedListOfPermalinks(value);
    select.sql(' and "key" in ' +
               '(select "contactdetail" from partycontactdetails where "party" in ' +
               '(select "from" from partyrelations where "to" in (').array(keys).sql(') and "type" = \'member\')) ');
  }

  var ret = {
    type: '/contactdetails',
    public: false,
    secure: [],
    schema: {
      $schema: 'http://json-schema.org/schema#',
      title: 'A contact detail of one of the parties involves in a mutual credit system or knowledge bank. ' +
        'It can be an address, e-mail, website, facebook, etc.. etc..',
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'The type of contactdetail.',
          enum: ['address', 'email', 'facebook', 'website']
        },
        label: $s.string('A display label for this contact detail.'),

        /* Generic value of the contact detail */
        value: $s.string('Value for a contact detail such as an email, website, facebook page. ' +
          'Addresses use different fields.'),

        /* Address fields */
        street: $s.string('Streetname of an address.'),
        streetnumber: $s.string('Street number of an address.'),
        streetbus: $s.string('Postal box of an address.'),
        zipcode: $s.belgianzipcode('4 digit postal code of the city for an address.'),
        city: $s.string('City for an address.'),
        latitude: $s.numeric('Latitude of an address.'),
        longitude: $s.numeric('Longitude of an address.'),

        'public': // eslint-disable-line
          $s.boolean('Is this contact detail visible to other members of your group (and all it\'s subgroups ?')
      },
      required: ['type', 'public']
    },
    map: {
      key: {},
      type: {},
      label: {
        onread: $m.removeifnull
      },
      value: {
        onread: $m.removeifnull
      },

      street: {
        onread: $m.removeifnull
      },
      streetnumber: {
        onread: $m.removeifnull
      },
      streetbus: {
        onread: $m.removeifnull
      },
      zipcode: {
        onread: $m.removeifnull
      },
      city: {
        onread: $m.removeifnull
      },
      latitude: {
        onread: $m.removeifnull
      },
      longitude: {
        onread: $m.removeifnull
      },

      'public': {} // eslint-disable-line
    },
    validate: [],
    query: {
      forPartiesReachableFromParties: forPartiesReachableFromParties,
      forDescendantsOfParties: forDescendantsOfParties,
      forAncestorsOfParties: forAncestorsOfParties,
      forParentsOfParties: forParentsOfParties,
      forChildrenOfParties: forChildrenOfParties,
      forParties: common.filterRelatedManyToMany($u, 'partycontactdetails', 'contactdetail', 'party'),
      forMessages: common.filterRelatedManyToMany($u, 'messagecontactdetails', 'contactdetail', 'message'),
      defaultFilter: $q.defaultFilter
    },
    queryDocs: {
      forPartiesReachableFromParties: 'Returns contact details that belong to parties that are reachable ' +
        '(potentially via a parent group / subgroup) from a given (comma separated) list of parties. ' +
        'The term "reachable" means the graph of parties will be scanned to all top parents of the ' +
        'given list of parties, and then recursed down to include all parties that are a member ' +
        '(directly or indirectly) of those parent.',
      forDescendantsOfParties: 'Returns contact details that belong to  ' +
        'direct or indirect members of a given (comma separated) list of parties.',
      forAncestorsOfParties: 'Returns contact details that belong to ancestors ' +
        '(direct or indirect parents via an "is member of" relation) of a given ' +
        '(comma separated) list of parties.',
      forParentsOfParties: 'Returns contact details that belong to direct parents ' +
        '(via an "is member of" relation) of a (comma separated) list of parties.',
      forChildrenOfParties: 'Returns contact details that belong to direct members ' +
        'of a (comma separated) list of parties.',
      forParties: 'Returns contact details for a given (comma separated) list of parties.',
      forMessages: 'Returns contact details associated to a (comma separated) list of messages.'
    },
    afterread: [
      common.addRelatedManyToMany($u, 'partycontactdetails', 'contactdetail', 'party', '/parties', '$$parties'),
      common.addRelatedManyToMany($u, 'messagecontactdetails', 'contactdetail', 'message', '/messages', '$$messages')
    ],
    afterupdate: [],
    afterinsert: [],
    afterdelete: []
  };

  common.objectMerge(ret, extra);
  return ret;
};
