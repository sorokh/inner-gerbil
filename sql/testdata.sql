-- Parties
-- LETS Groups

INSERT INTO "parties" VALUES ('8bf649b4-c50a-4ee9-9b02-877aa0a71849','group','LETS Regio Dendermonde',null,null,null,null,null,180,'duim','active');

-- People
INSERT INTO "parties" VALUES ('5df52f9f-e51f-4942-a810-1496c51e64db','person','Anna De Vlaming',null,'1980-10-11 00:00:00',null,'annadv','test',null,null,'active');

-- Relations
INSERT INTO "relations" VALUES('419e6446-9b3e-4e7d-9381-0c38af0b316a', '5df52f9f-e51f-4942-a810-1496c51e64db','8bf649b4-c50a-4ee9-9b02-877aa0a71849','member',0,'active');
