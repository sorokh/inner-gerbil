exports = module.exports = function(sri4node) {
    var $u = sri4node.utils;
    var $m = sri4node.mapUtils;
    var $s = sri4node.schemaUtils;
    var $q = sri4node.queryUtils;
    
    return {
        type: "/messages",
        public: true,
        secure : [],
        schema: {
            $schema: "http://json-schema.org/schema#",
            title: "A message posted by a person/organisation.",
            type: "object",
            properties : {
                author: $s.permalink('/parties','The person/organisation that posted this message.'),
                title: $s.string('Title of the message'),
                description: $s.string('Message body, in HTML.'),
                eventdate: $s.timestamp('If the message has tag "evenement", it must supply an event date/time here.'),
                amount: $s.numeric('The amount of currency requested/offered for a certain activity.'),
                unit: $s.string('The unit the currency amount applies to. Like : per hour, per item, per person, etc..'),
                tags: {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "minItems": 2,
                    "uniqueItems": true
                },
                photos: {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "minItems": 0,
                    "uniqueItems": false
                },
                created: $s.timestamp('When was the message created ?'),
                modified: $s.timestamp('When was the message last modified ?'),
                expires: $s.timestamp('When should the message be removed ?')
            },
            required: ["author","description","tags","created","modified"]
        },
        map: {
            author: { references: '/parties' },
            title: { onread: $m.removeifnull },
            description: {},
            eventdate: { onread: $m.removeifnull },
            amount: { onread: $m.removeifnull },
            unit: { onread: $m.removeifnull },
            tags: {},
            photos: { onread: $m.removeifnull },
            created: {},
            modified: {},
            expires: { onread: $m.removeifnull }
        },
        validate: [],
        query: {
        },
        afterupdate: [],
        afterinsert: [],
        afterdelete: []
    };
}