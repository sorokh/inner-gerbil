#!/bin/bash
npm install
sudo service postgresql start
sudo apt-get install postgresql-contrib-9.1 uuid
echo "CREATE SCHEMA innergerbil" | sudo sudo -u postgres psql
echo "REVOKE ALL PRIVILEGES ON SCHEMA innergerbil FROM gerbil" | sudo sudo -u postgres psql
echo "REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA innergerbil FROM gerbil" | sudo sudo -u postgres psql
echo "REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA innergerbil FROM gerbil" | sudo sudo -u postgres psql
echo "DROP USER gerbil" | sudo sudo -u postgres psql
echo "CREATE USER gerbil WITH PASSWORD 'inner'" | sudo sudo -u postgres psql

# construct tables.
./create-database.sh

echo "GRANT ALL PRIVILEGES ON SCHEMA innergerbil TO gerbil" | sudo sudo -u postgres psql
echo "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA innergerbil TO gerbil" | sudo sudo -u postgres psql
echo "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA innergerbil TO gerbil" | sudo sudo -u postgres psql
echo "ALTER USER gerbil SET search_path = innergerbil" | sudo sudo -u postgres psql
