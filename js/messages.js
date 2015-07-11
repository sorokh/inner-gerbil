/*jslint node: true */
"use strict";

var Q = require('q');

function addRelatedResources(type, column, targetkey) {
    return function(database, elements) {
        var deferred = Q.defer()

        if(elements && elements.length && elements.length > 0) {
            var tablename = type.split('/')[1]
            var query = prepare()
            var elementKeys = []
            var elementKeysToElement = {}
            elements.forEach(function(element) { 
                var permalink = element.$$meta.permalink
                var elementKey = permalink.split('/')[2]
                elementKeys.push(elementKey)
                elementKeysToElement[elementKey] = element
            });
            console.log(elements)
            console.log(elementKeys)
            query.sql('select key,' + column + ' as fkey from ' + tablename + ' where ' + column + ' in (').array(elementKeys).sql(')')
            pgExec(database, query).then(function(result) {
                result.rows.forEach(function(row) {
                    var element = elementKeysToElement[row.fkey]
                    if(!element[targetkey]) {
                        element[targetkey] = []
                    }
                    element[targetkey].push(type + '/' + row.key)
                });
                deferred.resolve()
            }).fail(function(e) {
                console.log(e.stack)
                deferred.reject()
            })
        } else {
            deferred.resolve()
        }

        return deferred.promise
    }
}

exports = module.exports = function(sri4node) {
    var $u = sri4node.utils,
        $m = sri4node.mapUtils,
        $s = sri4node.schemaUtils,
        $q = sri4node.queryUtils;

    return {
        type: "/messages",
        "public": true,
        secure : [],
        schema: {
            $schema: "http://json-schema.org/schema#",
            title: "A message posted by a person/organisation.",
            type: "object",
            properties : {
                author: $s.permalink('/parties', 'The person/organisation that posted this message.'),
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
            required: ["author", "description", "tags", "created", "modified"]
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
        afterread: [
            $u.addReferencingResources('/messagecontactdetails', 'message', '$$messagecontactdetails'),
            $u.addReferencingResources('/messageparties', 'message', '$$messageparties'),
            $u.addReferencingResources('/messagetransactions', 'message', '$$messagetransaction')
        ],
        afterupdate: [],
        afterinsert: [],
        afterdelete: []
    };
};
