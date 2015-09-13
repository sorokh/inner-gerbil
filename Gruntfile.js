/// <binding BeforeBuild='eslint' />
module.exports = function (grunt) {
    // section 1 - require modules
    require('load-grunt-tasks')(grunt);

    // section 2 - configure grunt
    grunt.initConfig({
      eslint: {
        options: {
          config: '.eslintrc',
          reset: true
        },
        target: ['js/**/*.js']
      }
    });

    // section 3 - register grunt tasks
    grunt.registerTask('default', ['eslint']);

  };
