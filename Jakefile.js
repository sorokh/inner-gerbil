var os = require('os');

desc('Recreates database.');
task('create-database', { async: true }, function () {
    var cmds = [
        'psql -U postgres "CREATE SCHEMA innergerbil"',
        'psql -U postgres "REVOKE ALL PRIVILEGES ON SCHEMA innergerbil FROM gerbil"',
        'psql -U postgres "REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA innergerbil FROM gerbil"',
        'psql -U postgres "REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA innergerbil FROM gerbil"',
        'psql -U postgres "DROP USER gerbil"',
        'psql -U postgres "CREATE USER gerbil WITH PASSWORD \'inner\'"',
        'psql -U postgres --file ./sql/schema.sql',
        'psql -U postgres --file ./sql/testdata.sql',
        'psql -U postgres --file ./sql/privileges.sql'
    ];
    jake.exec(cmds, { printStdout: true }, function () {
        console.log('Database created.');
        complete();
    });
    
    // Test to log OS version if we need to do something different for windows
    console.log(os.platform());
    console.log(os.release());
})
