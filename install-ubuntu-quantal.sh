#!/bin/bash
npm install
sudo service postgresql start
sudo apt-get install postgresql-contrib-9.1 uuid
echo "REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM gerbil" | sudo sudo -u postgres psql
echo "REVOKE ALL PRIVILEGES ON DATABASE postgres FROM gerbil" | sudo sudo -u postgres psql
echo "DROP USER gerbil" | sudo sudo -u postgres psql
echo "CREATE USER gerbil WITH PASSWORD 'inner'" | sudo sudo -u postgres psql

# construct tables.
./create-database.sh

echo "GRANT ALL PRIVILEGES ON DATABASE postgres TO gerbil" | sudo sudo -u postgres psql
echo "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gerbil" | sudo sudo -u postgres psql
