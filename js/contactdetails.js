exports = module.exports = function(sri4node) {
    var $u = sri4node.utils
    var $m = sri4node.mapUtils
    var $s = sri4node.schemaUtils
    var $q = sri4node.queryUtils
    
    return {
        type: "/contactdetails",
        public: true,
        secure : [],
        schema: {
            $schema: "http://json-schema.org/schema#",
            title: "A contact detail of one of the parties involves in a mutual credit system. It can be an adres, e-mail, website, facebook, etc.. etc..",
            type: "object",
            properties : {
                type: {
                    type: "string",
                    description: "The type of contactdetail.",
                    enum: ["address","email","facebook","website"]
                },
                label: $s.string("A display label for this contact detail."),

                /* Generic value of the contact detail */
                value: $s.string("Value for this contact detail. Addresses use different fields."),
                /* Address fields */
                street: $s.string("Streetname of the address of residence."),
                streetnumber: $s.string("Street number of the address of residence."),
                streetbus: $s.string("Postal box of the address of residence."),
                zipcode: $s.belgianzipcode("4 digit postal code of the city for the address of residence."),
                city: $s.string("City for the address of residence."),
                latitude: $s.numeric("Latitude of the address."),
                longitude: $s.numeric("Longitude of the address."),

                public: $s.boolean("Is this contact detail visible to other members of your group (and all it's subgroups ?")
            },
            required: ["type","public"]
        },
        map: {
            type: {},
            label: { onread: $m.removeifnull },
            value: { onread: $m.removeifnull },

            street: { onread: $m.removeifnull },
            streetnumber: { onread: $m.removeifnull },
            streetbus: { onread: $m.removeifnull },
            zipcode: { onread: $m.removeifnull },
            city: { onread: $m.removeifnull },
            latitude: { onread: $m.removeifnull },
            longitude: { onread: $m.removeifnull },

            public: {}
        },
        validate: [],
        query: {
        },
        afterupdate: [],
        afterinsert: [],
        afterdelete: []
    };
}