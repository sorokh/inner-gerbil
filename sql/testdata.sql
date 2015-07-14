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
INSERT INTO "partyrelations" VALUEs('cddffa35-6a2f-46c4-aa39-5b9040b4f429','aca5e15d-9f4c-4c79-b906-f7e868b3abc5','8bf649b4-c50a-4ee9-9b02-877aa0a71849','member',0,'active');

-- Anna in LETS Lebbeke
INSERT INTO "partyrelations" VALUES('419e6446-9b3e-4e7d-9381-0c38af0b316a', '5df52f9f-e51f-4942-a810-1496c51e64db','aca5e15d-9f4c-4c79-b906-f7e868b3abc5','member',-20,'active');
-- Steven in LETS Lebbeke
INSERT INTO "partyrelations" VALUES('db41c12a-a521-443a-97f1-f0e14658fb78', 'fa17e7f5-ade9-49d4-abf3-dc3722711504','aca5e15d-9f4c-4c79-b906-f7e868b3abc5','member',20,'active');

-- Contactdetails
-- Anna De Vlaming
INSERT INTO "contactdetails" VALUES('843437b3-29dd-4704-afa8-6b06824b2e92','address','thuis','Ijzerenweg','14',null,'9280','Lebbeke',50.9961341,4.1464628,null,true);
INSERT INTO "partycontactdetails" VALUES('986b91dd-1bcc-4703-ae8d-6799442a7518','5df52f9f-e51f-4942-a810-1496c51e64db','843437b3-29dd-4704-afa8-6b06824b2e92');
INSERT INTO "contactdetails" VALUES('b059ef61-340c-45d8-be4f-02436bcc03d9','email',null,null,null,null,null,null,null,null,'anna@email.be',true);
INSERT INTO "partycontactdetails" VALUES('469062e5-0c7c-4c0b-9db9-6e1e1676da9c','5df52f9f-e51f-4942-a810-1496c51e64db','b059ef61-340c-45d8-be4f-02436bcc03d9');
-- LETS Dendermonde
INSERT INTO "contactdetails" VALUES('96de9531-d777-4dca-9997-7a774d2d7595','address',null,'Beekveldstraat','1a','2','9280','Lebbeke',50.9948538,4.1473891,null,true);
INSERT INTO "partycontactdetails" VALUES('5e47192d-1957-4959-89bb-3418ab296080','8bf649b4-c50a-4ee9-9b02-877aa0a71849','96de9531-d777-4dca-9997-7a774d2d7595');

-- Transactions
INSERT INTO "transactions" VALUES('e068c284-26f1-4d11-acf3-8942610b26e7','5df52f9f-e51f-4942-a810-1496c51e64db','fa17e7f5-ade9-49d4-abf3-dc3722711504',20,null);

-- Transaction trace
INSERT INTO "transactionrelations" VALUES('cd5dfc1a-662d-4fb9-b322-c4676722388a','e068c284-26f1-4d11-acf3-8942610b26e7','419e6446-9b3e-4e7d-9381-0c38af0b316a',-20);
INSERT INTO "transactionrelations" VALUES('525fbf3b-5886-47e3-a08a-8b5273a944cb','e068c284-26f1-4d11-acf3-8942610b26e7','db41c12a-a521-443a-97f1-f0e14658fb78',20);

-- Messages
-- For Anna
INSERT INTO "messages" VALUES('a998ff05-1291-4399-8604-16001015e147','5df52f9f-e51f-4942-a810-1496c51e64db','Help met windows 8','Ik ben meer vertrouwd met windows 7, en weet soms niet waar iets staat. Wie kan me wat hulp/advies geven.',null,20,'uur',ARRAY['dienst','vraag'],null,'2015-01-13','2015-01-14','2016-01-13');
INSERT INTO "messages" VALUES('b7c41d85-687d-4f9e-a4ef-0c67515cbb63','5df52f9f-e51f-4942-a810-1496c51e64db','Rabarberchutnet','Zelfgemaakte chutney van rabarber met abrikoos, limoen, gember, pepertjes en nog andere kruiden.',null,5,'potje (150gr)',ARRAY['goed','aanbod','artisanaal'],null,'2015-01-13','2015-01-14','2016-01-13');
INSERT INTO "messages" VALUES('1f2e1d34-c3b7-42e8-9478-45cdc0839427','5df52f9f-e51f-4942-a810-1496c51e64db','Vegetarisch kookles','Ben je pas veggie, of wil je dat graag worden ? Ik geef je graag wat meer uitleg, onder het bereiden van een lekker gerecht. Leer zélf lekker eten klaar te maken !',null,20,'uur',ARRAY['dienst','aanbod','huishoudelijk','koken'],null,'2015-01-13','2015-01-14','2016-01-13');
INSERT INTO "messages" VALUES('0cc3d15f-47ef-450a-a0ac-518202d7a67b','5df52f9f-e51f-4942-a810-1496c51e64db','Bio Asperges','Ik heb, zoals elk voorjaar, een overproductie aan zelfgekweekte bio-asperges. Wie wil er een bussel ? Ik kan ze komen brengen (per fiets).',null,15,'bussel',ARRAY['goed','aanbod','artisanaal','tuin'],null,'2015-01-23','2015-01-25','2015-05-01');
-- For Steven
INSERT INTO "messages" VALUES('642f3d85-a21e-44d0-b6b3-969746feee9b','fa17e7f5-ade9-49d4-abf3-dc3722711504','Indisch Veggie Etentje','Wie heeft er zin om mee aan te schuiven aan ons veggie Indisch buffet ? Er is plaats voor maximum 16 personen.','2015-04-04',15,'persoon',ARRAY['dienst','aanbod','evenement','eten'],null,'2015-02-03','2015-02-03','2015-04-04');
INSERT INTO "messages" VALUES('d1c23a0c-4420-4bd3-9fa0-d542b0155a15','fa17e7f5-ade9-49d4-abf3-dc3722711504','Defecte schakelaar','Eén van de schakelaars in mijn living is defect... Wie zou dat voor mij kunnen herstellen ?', null, 20, 'uur',ARRAY['dienst','vraag','herstellen'],null,'2015-02-03','2015-02-03','2015-04-01');

-- Contact details for event
INSERT INTO "contactdetails" VALUES('3362d325-cf19-4730-8490-583da50e114e','address',null,'Stationstraat','15',null,'9280','Lebbeke',51.0018547,4.1304841,null,true);
INSERT INTO "messagecontactdetails" VALUES('aac80841-3e05-4139-b8de-8bb5159f893c','d1c23a0c-4420-4bd3-9fa0-d542b0155a15','3362d325-cf19-4730-8490-583da50e114e');