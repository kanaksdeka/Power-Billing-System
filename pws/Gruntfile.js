// Generated on 2015-11-25 using generator-angular-fullstack 2.1.1
'use strict';

module.exports = function (grunt) {
  var localConfig;
  try {
    localConfig = require('./server/config/local.env');
  } catch(e) {
    localConfig = {};
  }

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    protractor: 'grunt-protractor-runner',
    buildcontrol: 'grunt-build-control',
    jscs:'jscs'

  });
   // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    yeoman: {
      // configurable paths
     // client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },
    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: 'server/app.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/server/app.js'
        }
      }
    },
    watch: {
      
      mochaTest: {
        files: ['server/**/*.spec.js'],
        tasks: ['env:test', 'mochaTest']
      },
      
      gruntfile: {
        files: ['Gruntfile.js']
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {      
      server: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [
          'server/**/*.js',
          '!server/**/*.spec.js'
        ]
      },
      serverTest: {
        options: {
          jshintrc: 'server/.jshintrc-spec'
        },
        src: ['server/**/*.spec.js']
      }
     
    },
    jscs: {      
      server: {
        options: {
          jshintrc: 'server/.jscsrc'
        },
        src: [
          'server/**/*.js',
          '!server/**/*.spec.js'
        ]
      },
      serverTest: {
        options: {
          jshintrc: 'server/.jshintrc-spec'
        },
        src: ['server/**/*.spec.js']
      }
     
    },
    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/.openshift',
            '!<%= yeoman.dist %>/Procfile'
          ]
        }]
      },
      server: '.tmp'
    }, 

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              setTimeout(function () {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },    

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*',
            'client/**/*',
            '!server/api/validation/config/validation-list-mtni.js',
            '!server/api/validation/config/validation-list-weca.js',
            '!server/api/validation/config/validation-config-mtni.js',
            '!server/api/validation/config/validation-config-weca.js'

          ]
        }]
      },
      dist_mtni: {
        files: [{
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*',
            'client/**/*',
            '!server/api/validation/config/validation-list-default.js',
            '!server/api/validation/config/validation-list-weca.js',
            '!server/api/validation/config/validation-config-default.js',
            '!server/api/validation/config/validation-config-weca.js'
          ]
        }]
      },
      dist_weca: {
        files: [{
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*',
            'client/**/*',
            '!server/api/validation/config/validation-list-default.js',
            '!server/api/validation/config/validation-list-mtni.js',
            '!server/api/validation/config/validation-config-default.js',
            '!server/api/validation/config/validation-config-mtni.js'
          ]
        }]
      }
    },
    compress: {
    dist: {
        options: {
            archive: 'dist/build.zip',
            mode: 'zip'
        },
        files: [
            { src: './dist/**' }
        ]
    }
},


    // Run some tasks in parallel to speed up the build process
    concurrent: {
    
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['server/**/*.spec.js']
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      chrome: {
        options: {
          args: {
            browser: 'chrome'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    }

  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'env:all', 'env:prod', 'express:prod', 'wait', 'open', 'express-keepalive']);
    }

    if (target === 'debug') {
      return grunt.task.run([
        'clean:server',
        'env:all',        
        'concurrent:debug'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'env:all',     
      'express:dev',
      'wait',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', function(target) {    
      grunt.task.run([
        'env:all',
        'env:test',
        'mochaTest'
      ]);
   

    
  });

  grunt.registerTask('build',function(target){
      
      grunt.task.run([
        'env:prod'  
      ,'clean:dist'
	  ,'copy:dist'
       
      ]);
   /* if(target === 'default'){
		       grunt.log.warn('target :: \n' + target);
        grunt.task.run([               
          'copy:dist'
        ]);
     }if(target === 'mtni'){
      grunt.log.warn('target :: \n' + target);
        grunt.task.run([               
          'copy:dist_mtni'
        ]);
     }if(target === 'weca'){
      grunt.log.warn('target :: \n' + target);
        grunt.task.run([               
          'copy:dist_weca'
        ]);
     }*/

  });

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};

