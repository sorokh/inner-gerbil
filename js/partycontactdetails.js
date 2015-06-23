exports = module.exports = function(sri4node) {
    var $u = sri4node.utils;
    var $m = sri4node.mapUtils;
    var $s = sri4node.schemaUtils;
    var $q = sri4node.queryUtils;
    
    return {
        type: "/partycontactdetails",
        public: true,
        secure : [],
        schema: {
            $schema: "http://json-schema.org/schema#",
            title: "Parties can have contact details associated. These are scoped in the lifetime of the party.",
            type: "object",
            properties : {
                party: $s.permalink('/parties','The party the contactdetail belongs to.'),
                contactdetail: $s.permalink('/contactdetails','The contactdetail that is associated with the party.'),
            },
            required: ['party','contactdetail']
        },
        map: {
            party: { references: '/parties' },
            contactdetail: { references: '/contactdetails' },
        },
        validate: [],
        query: {
        },
        afterupdate: [],
        afterinsert: [],
        afterdelete: []
    };
}