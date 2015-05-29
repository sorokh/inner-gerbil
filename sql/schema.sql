-- Needed for uuid_generate_v4() function.
CREATE EXTENSION "uuid-ossp";

DROP TABLE IF EXISTS "transactionmessages" CASCADE;
DROP TABLE IF EXISTS "messagegroups" CASCADE;
DROP TABLE IF EXISTS "messagetags" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "transactionrelations" CASCADE;
DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "parties" CASCADE;
DROP TABLE IF EXISTS "relations" CASCADE;
DROP TABLE IF EXISTS "contactdetails" CASCADE;

CREATE TABLE "parties" (
    "guid" character varying(36) unique not null,
    "type" character varying(64) not null,
    "name" character varying(256) not null,
    "alias" character varying(64),
    "dateofbirth" timestamp with time zone,
    "imageurl" character varying(2048),
    "login" character varying(64),
    "password" character varying(64),
    "secondsperunit" integer,
    "currencyname" character varying(64),
    "status" character varying(32) not null /* active, inactive, ... */
);

CREATE TABLE "relations" (
    "guid" character varying(36) unique not null,
    "from" character varying(36) references "parties"(guid) not null,
    "to" character varying(36) references "parties"(guid) not null,
    "type" character varying(64) not null,
    "balance" bigint,
    "status" character varying(32) not null /* active/inactive */
);

CREATE TABLE "contactdetails" (
    "guid" character varying(36) unique not null,
    "party" character varying(36) references "parties"(guid),
    
    "type" character varying(32) not null,
    "label" character varying(128),

    "street" character varying(256),
    "streetnumber" character varying(16),
    "streetbus" character varying(16),
    "zipcode" character varying(10),
    "city" character varying(64),
    "latitude" double precision,
    "longitude" double precision,

    "value" character varying(2048),
    
    "public" boolean not null
);

CREATE TABLE "transactions" (
    "guid" character varying(36) unique not null,
    "from" character varying(36) references "parties"(guid) not null,
    "to" character varying(36) references "parties"(guid) not null,
    "amount" bigint not null,
    "description" character varying(256)
);

CREATE TABLE "transactionrelations" (
    "guid" character varying(36) unique not null,
    "transaction" character varying(36) references "transactions"(guid) not null,
    "relation" character varying(36) references "relations"(guid) not null,
    "amount" bigint not null
);

-- MESSAGES

CREATE TABLE "messages" (
    "guid" character varying(36) unique not null,
    "poster" character varying(36) references "parties"(guid) not null,
    "posted" timestamp with time zone not null default (now() at time zone 'utc'),
    "title" character varying(256) not null,
    "description" character varying(1024),
    "amount" integer,
    "unit" character varying(32)
);

CREATE TABLE "messagetags" (
    "guid" character varying(36) unique not null,
    "message" character varying(36) references "messages"(guid) not null,
    "tag" character varying(36)
);

CREATE TABLE "messagegroups" (
    "guid" character varying(36) unique not null,
    "message" character varying(36) references "messages"(guid) not null,
    "group" character varying(36) references "parties"(guid) not null
);

CREATE TABLE "transactionmessages" (
    "guid" character varying(36) unique not null,
    "transaction" character varying(36) references "transactions"(guid) not null,
    "message" character varying(36) references "messages"(guid)
);