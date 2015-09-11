#!/bin/bash
cat sql/clean-database.sql sql/schema.sql sql/testdata.sql | heroku pg:psql
