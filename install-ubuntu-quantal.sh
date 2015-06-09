#!/bin/bash
npm install
sudo service postgresql start
sudo apt-get install postgresql-contrib-9.1 uuid

./create-database.sh