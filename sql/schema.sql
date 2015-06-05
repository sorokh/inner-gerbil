SET search_path TO innergerbil;

DROP TABLE IF EXISTS "contactdetails" CASCADE;

DROP TABLE IF EXISTS "parties" CASCADE;
DROP TABLE IF EXISTS "partycontactdetails" CASCADE;

DROP TABLE IF EXISTS "relations" CASCADE;

DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "transactionrelations" CASCADE;

DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "messagecontactdetails" CASCADE;
DROP TABLE IF EXISTS "messagetags" CASCADE;
DROP TABLE IF EXISTS "messageparties" CASCADE;
DROP TABLE IF EXISTS "messagephotos" CASCADE;
DROP TABLE IF EXISTS "messagetransactions" CASCADE;

-- Contactdetails
CREATE TABLE "contactdetails" (
    "guid" text unique not null,
    
    "type" text not null,   
    "label" text,

    "street" text,
    "streetnumber" text,
    "streetbus" text,
    "zipcode" text,
    "city" text,
    "latitude" double precision,
    "longitude" double precision,

    "value" text,
    
    "public" boolean not null
);

-- Parties and relations
CREATE TABLE "parties" (
    "guid" text unique not null,
    "type" text not null,
    "name" text not null,
    "alias" text,
    "dateofbirth" timestamp with time zone,
    "imageurl" text,
    "login" text,
    "password" text,
    "secondsperunit" integer,
    "currencyname" text,
    "status" text not null /* active, inactive, ... */
);

CREATE TABLE "partycontactdetails" (
    "guid" text unique not null,
    "party" text references "parties"(guid) not null,
    "contactdetail" text references "contactdetails"(guid) not null
);

-- Relationships between parties.
CREATE TABLE "relations" (
    "guid" text unique not null,
    "from" text references "parties"(guid) not null,
    "to" text references "parties"(guid) not null,
    "type" text not null,
    "balance" bigint,
    "status" text not null /* active/inactive */
);

-- Transactions
CREATE TABLE "transactions" (
    "guid" text unique not null,
    "from" text references "parties"(guid) not null,
    "to" text references "parties"(guid) not null,
    "amount" bigint not null,
    "description" text
);

CREATE TABLE "transactionrelations" (
    "guid" text unique not null,
    "transaction" text references "transactions"(guid) not null,
    "relation" text references "relations"(guid) not null,
    "amount" bigint not null
);

-- Messages
CREATE TABLE "messages" (
    "guid" text unique not null,
    "author" text references "parties"(guid) not null,
    "title" text not null,    
    "description" text,
    "eventdate" timestamp with time zone,
    "amount" integer,
    "unit" text,
    "tags" text array,
    "photos" text array,
    "created" timestamp with time zone not null default (now() at time zone 'utc'),
    "modified" timestamp with time zone not null default (now() at time zone 'utc'),
    "expires" timestamp with time zone not null
);

-- To support postgreSQL full text search :
-- ALTER TABLE messages ADD COLUMN search tsvector;
-- CREATE TRIGGER searchupdate BEFORE INSERT OR UPDATE ON messages FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(search, 'pg_catalog.dutch', title, description);
-- CREATE INDEX searchindex ON messages USING gin(search);
-- Example search : SELECT * FROM MESSAGES WHERE search @@ to_tsquery('dutch','schakel:*');

CREATE TABLE "messagecontactdetails" (
    "guid" text unique not null,
    "message" text references "messages"(guid) not null,
    "contactdetail" text references "contactdetails"(guid) not null
);

CREATE TABLE "messageparties" (
    "guid" text unique not null,
    "message" text references "messages"(guid) not null,
    "party" text references "parties"(guid) not null
);

CREATE TABLE "messagetransactions" (
    "guid" character varying(36) unique not null,
    "message" character varying(36) references "messages"(guid),
    "transaction" character varying(36) references "transactions"(guid) not null
);