SET search_path TO innergerbil;

DROP TABLE IF EXISTS "parties" CASCADE;
DROP TABLE IF EXISTS "relations" CASCADE;
DROP TABLE IF EXISTS "contactdetails" CASCADE;

DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "transactionrelations" CASCADE;

DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "messagecontactdetails" CASCADE;
DROP TABLE IF EXISTS "messagetags" CASCADE;
DROP TABLE IF EXISTS "messageparties" CASCADE;
DROP TABLE IF EXISTS "messagephotos" CASCADE;
DROP TABLE IF EXISTS "messagetransactions" CASCADE;

-- Parties and relations
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

-- Transactions

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

-- Messages
CREATE TABLE "messages" (
    "guid" character varying(36) unique not null,
    "poster" character varying(36) references "parties"(guid) not null,
    "title" character varying(256) not null,    
    "description" character varying(2048),
    "eventdate" timestamp with time zone,
    "amount" integer,
    "unit" character varying(32),
    "created" timestamp with time zone not null default (now() at time zone 'utc'),
    "modified" timestamp with time zone not null default (now() at time zone 'utc'),
    "expires" timestamp with time zone not null
);

CREATE TABLE "messagecontactdetails" (
    "guid" character varying(36) unique not null,
    "message" character varying(36) references "messages"(guid) not null,
    "contactdetail" character varying(36) references "contactdetails"(guid) not null
);

CREATE TABLE "messagetags" (
    "guid" character varying(36) unique not null,
    "message" character varying(36) references "messages"(guid) not null,
    "tag" character varying(36)
);

CREATE TABLE "messageparties" (
    "guid" character varying(36) unique not null,
    "message" character varying(36) references "messages"(guid) not null,
    "party" character varying(36) references "parties"(guid) not null
);

CREATE TABLE "messagephotos" (
    "guid" character varying(36) unique not null,
    "message" character varying(36) references "messages"(guid) not null,
    "url" character varying(8192) not null,
    "description" character varying(1024)
);

CREATE TABLE "messagetransactions" (
    "guid" character varying(36) unique not null,
    "message" character varying(36) references "messages"(guid),
    "transaction" character varying(36) references "transactions"(guid) not null
);
