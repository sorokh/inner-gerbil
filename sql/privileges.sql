﻿GRANT ALL PRIVILEGES ON SCHEMA innergerbil TO gerbil;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA innergerbil TO gerbil;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA innergerbil TO gerbil;
ALTER USER gerbil SET search_path = innergerbil;
