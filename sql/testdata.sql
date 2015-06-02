SET search_path TO innergerbil;

-- Parties
-- LETS Groups

INSERT INTO "parties" VALUES ('8bf649b4-c50a-4ee9-9b02-877aa0a71849','group','LETS Regio Dendermonde',null,null,null,null,null,180,'duim','active');
INSERT INTO "parties" VALUES ('aca5e15d-9f4c-4c79-b906-f7e868b3abc5','subgroup','LETS Lebbeke',null,null,null,null,null,180,'duim','active');

-- People
INSERT INTO "parties" VALUES ('5df52f9f-e51f-4942-a810-1496c51e64db','person','Anna De Vlaming',null,'1980-10-11 00:00:00',null,'annadv','test',null,null,'active');
INSERT INTO "parties" VALUES ('fa17e7f5-ade9-49d4-abf3-dc3722711504','person','Steven Buytink',null,'1979-04-01 00:00:00',null,'stevenb','test',null,null,'active');

-- Relations
-- LETS Lebbeke is a member of LETS Dendermonde
INSERT INTO "relations" VALUEs('cddffa35-6a2f-46c4-aa39-5b9040b4f429','aca5e15d-9f4c-4c79-b906-f7e868b3abc5','8bf649b4-c50a-4ee9-9b02-877aa0a71849','member',0,'active');

-- Anna in LETS Lebbeke
INSERT INTO "relations" VALUES('419e6446-9b3e-4e7d-9381-0c38af0b316a', '5df52f9f-e51f-4942-a810-1496c51e64db','aca5e15d-9f4c-4c79-b906-f7e868b3abc5','member',-20,'active');
-- Steven in LETS Lebbeke
INSERT INTO "relations" VALUES('db41c12a-a521-443a-97f1-f0e14658fb78', 'fa17e7f5-ade9-49d4-abf3-dc3722711504','aca5e15d-9f4c-4c79-b906-f7e868b3abc5','member',20,'active');

-- Contactdetails
-- Anna De Vlaming
INSERT INTO "contactdetails" VALUES('843437b3-29dd-4704-afa8-6b06824b2e92','5df52f9f-e51f-4942-a810-1496c51e64db','address','thuis','Ijzerenweg','14',null,'9280','Lebbeke',50.9961341,4.1464628,null,true);
INSERT INTO "contactdetails" VALUES('b059ef61-340c-45d8-be4f-02436bcc03d9','5df52f9f-e51f-4942-a810-1496c51e64db','email',null,null,null,null,null,null,null,null,'anna@email.be',true);
-- LETS Dendermonde
INSERT INTO "contactdetails" VALUES('96de9531-d777-4dca-9997-7a774d2d7595','8bf649b4-c50a-4ee9-9b02-877aa0a71849','address',null,'Beekveldstraat','1a','2','9280','Lebbeke',50.9948538,4.1473891,null,true);

-- Transactions
INSERT INTO "transactions" VALUES('e068c284-26f1-4d11-acf3-8942610b26e7','5df52f9f-e51f-4942-a810-1496c51e64db','fa17e7f5-ade9-49d4-abf3-dc3722711504',20,null);

-- Transaction trace
INSERT INTO "transactionrelations" VALUES('cd5dfc1a-662d-4fb9-b322-c4676722388a','e068c284-26f1-4d11-acf3-8942610b26e7','419e6446-9b3e-4e7d-9381-0c38af0b316a',-20);
INSERT INTO "transactionrelations" VALUES('525fbf3b-5886-47e3-a08a-8b5273a944cb','e068c284-26f1-4d11-acf3-8942610b26e7','db41c12a-a521-443a-97f1-f0e14658fb78',20);