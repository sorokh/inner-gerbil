/*jslint node: true */
"use strict";

exports = module.exports = function (sri4node) {
    var $u = sri4node.utils,
        $m = sri4node.mapUtils,
        $s = sri4node.schemaUtils,
        $q = sri4node.queryUtils;

    return {
        type: "/transactionrelations",
        "public": true,
        secure : [],
        schema: {
            $schema: "http://json-schema.org/schema#",
            title: "A relation that was affected by a transaction. It's balance was altered by the mentioned transaction. For every transaction in the system these resources provide a record of the details on how the transaction was routed over (possibly multiple) subgroups, groups, connector groups, etc..",
            type: "object",
            properties : {
                transaction: $s.permalink('/transactions', 'The transaction this part belongs to.'),
                relation: $s.permalink('/relations', 'The relation that was affected by the transaction.'),
                amount: $s.numeric("The amount of credit. If this is a time-bank it is expressed in seconds.")
            },
            required: ["transaction", "relation", "amount"]
        },
        map: {
            transaction: { references: '/transactions' },
            relation: { references: '/relations' },
            amount: {}
        },
        validate: [],
        query: {
            transaction : $q.filterReferencedType('/transactions', 'transaction'),
            relation : $q.filterReferencedType('/relations', 'relation')
        },
        afterupdate: [],
        afterinsert: [],
        afterdelete: []
    };
};