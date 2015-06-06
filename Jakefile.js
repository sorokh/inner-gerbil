var os = require('os');

desc('Recreates database.');
task('create-database', { async: true }, function () {
    var cmds = [
        'psql --dbname=lets -U postgres --file ./sql/schema.sql',
        'psql --dbname=lets -U postgres --file ./sql/testdata.sql',
        'psql --dbname=lets -U postgres --file ./sql/privileges.sql'
    ];
    jake.exec(cmds, { printStdout: true }, function () {
        console.log('Database created.');
        complete();
    });
    
    // Test to log OS version if we need to do something different for windows
    console.log(os.platform()); // 'darwin'
    console.log(os.release()); //'10.8.0'
})
