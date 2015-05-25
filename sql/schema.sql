-- Needed for uuid_generate_v4() function.
CREATE EXTENSION "uuid-ossp";

DROP TABLE IF EXISTS "transactionmessages" CASCADE;
DROP TABLE IF EXISTS "messagegroups" CASCADE;
DROP TABLE IF EXISTS "messagetags" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "parties" CASCADE;
DROP TABLE IF EXISTS "relations" CASCADE;
DROP TABLE IF EXISTS "contactdetails" CASCADE;

CREATE TABLE "contactdetails" (
    "guid" character varying(36) unique,
    
    "type" character varying(32) unique,

    "street" character varying(256),
    "streetnumber" character varying(16),
    "streetbus" character varying(16),
    "zipcode" character varying(10),
    "city" character varying(64),
    "latitude" double precision,
    "longitude" double precision,

    "phone" character varying(32),
    "email" character varying(64),
    "website" character varying(2048),
    "facebook" character varying(2048) unique
);

CREATE TABLE "parties" (
    "guid" character varying(36) unique,
    "type" character varying(64),
    "name" character varying(256),
    "alias" character varying(64),
    "dateofbirth" timestamp with time zone,
    "imageurl" character varying(2048),
    "login" character varying(64),
    "password" character varying(64),
    "secondsperunit" integer,
    "currencyname" character varying(64),
    "status" character varying(32) /* active, inactive, ... */
);

CREATE TABLE "relations" (
  "guid" character varying(36) unique,
  "from" character varying(36) references "parties"(guid),
  "to" character varying(36) references "parties"(guid),
  "balance" bigint,
  "role" character varying(64)
);

CREATE TABLE "transactions" (
    "guid" character varying(36) unique,
    "from" character varying(36) references "parties"(guid),
    "to" character varying(36) references "parties"(guid),
    "amount" bigint,
    "description" character varying(256)
);

CREATE TABLE "messages" (
    "guid" character varying(36) unique,
    "poster" character varying(36) references "parties"(guid),
    "posted" timestamp with time zone not null default (now() at time zone 'utc'),
    "title" character varying(256) not null,
    "description" character varying(1024),
    "amount" integer,
    "unit" character varying(32)
);

CREATE TABLE "messagetags" (
    "guid" character varying(36) unique,
    "message" character varying(36) references "messages"(guid),
    "tag" character varying(36)
);

CREATE TABLE "messagegroups" (
    "guid" character varying(36) unique,
    "message" character varying(36) references "messages"(guid),
    "group" character varying(36) references "parties"(guid)
);

CREATE TABLE "transactionmessages" (
    "guid" character varying(36) unique,
    "transaction" character varying(36) references "transactions"(guid),
    "message" character varying(36) references "messages"(guid)
);