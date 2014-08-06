/*!
 * Gruntfile.js
 * 
 * Copyright (c) 2014
 */


module.exports = function (grunt) {


// Load tasks
require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  
// Browsers
var browsers = [
  // Latest Versions
  { browserName: 'firefox', platform: 'WIN8' },
  { browserName: 'chrome', platform: 'WIN8' },
  // { browserName: 'opera', platform: 'WIN7' },

  // Internet Explorer
  { browserName: 'internet explorer', platform: 'WIN8', version: '10' },
  { browserName: 'internet explorer', platform: 'VISTA', version: '9' },
  { browserName: 'internet explorer', platform: 'XP', version: '8' }
];


// ----------------------------------------------------------------------------
// DEPENDENCIES
// ----------------------------------------------------------------------------

// Core
var spawn = require('child_process').spawn,
    path  = require('path');
  

// ----------------------------------------------------------------------------
// TASK
// ----------------------------------------------------------------------------
var procs = {};

// We need to register a custom task to spawn our testing api
grunt.registerMultiTask('process', 'launch', function() {
  var filePath = path.join(process.cwd(), this.filesSrc[0]),
      proc     = procs[this.target];

  if (this.args.shift() === 'stop' && proc) {
    proc.kill('SIGINT');
  } else if (!proc) {
    procs[this.target] = spawn('node', [filePath]);
  }
});


// Config
grunt.initConfig({

  // --------------------------------------------------------------------------
  // PKG CONFIG
  // --------------------------------------------------------------------------

  'pkg': grunt.file.readJSON('package.json'),


  // --------------------------------------------------------------------------
  // JSHINT
  // --------------------------------------------------------------------------

  'jshint': {
    src: [
      'Gruntfile.js',
      'src/**/*.js',
      'test/**/*.js'
    ],
    build: [
      'dist/**/*.js',
      '!dist/**/*.min.js'
    ],
    options: {
      jshintrc: '.jshintrc',
      force: true
    }
  },


  // --------------------------------------------------------------------------
  // CLEAN (EMPTY DIRECTORY)
  // --------------------------------------------------------------------------

  'clean': {
    js: ['dist'],
    build: ['dist/*.*']
  },


  // --------------------------------------------------------------------------
  // REQUIREJS BUILD
  // --------------------------------------------------------------------------

  'requirejs': {
    compile: {
      options: {
        name: '_index',
        baseUrl: 'src',
        out: 'dist/rc-socket.js',
        optimize: 'none',
        skipModuleInsertion: true,
        paths: {
          'rc-socket': '../src'
        },
        onModuleBundleComplete: function(data) {
          var fs = require('fs'),
            amdclean = require('amdclean'),
            outputFile = data.path;

          fs.writeFileSync(outputFile, amdclean.clean({
            filePath: outputFile,
            prefixMode: 'camelCase',
            wrap: false,
            escodegen: {
              format: {
                indent: { style: '  ' }
              }
            }
          }));
        }
      }
    }
  },


  // --------------------------------------------------------------------------
  // UMD WRAP
  // --------------------------------------------------------------------------

  'umd': {
    umd: {
      src: 'dist/rc-socket.js',
      objectToExport: 'rcSocket',
      globalAlias: 'RcSocket',
      dest: 'dist/rc-socket.js'
    }
  },


  // --------------------------------------------------------------------------
  // MINIFY JS
  // --------------------------------------------------------------------------

  'uglify': {
    all: {
      expand: true,
      cwd: 'dist/',
      src: ['**/*.js'],
      dest: 'dist/',
      ext: '.min.js'
    }
  },


  // --------------------------------------------------------------------------
  // CREATE COMMONJS VERSION IN DIST
  // --------------------------------------------------------------------------

  'nodefy': {
    all: {
      expand: true,
      src: ['**/*.js'],
      cwd: 'src/',
      dest: 'dist/common'
    }
  },


  // --------------------------------------------------------------------------
  // Copy Parts
  // --------------------------------------------------------------------------

  'copy': {
    js: {
      expand: true,
      src: ['**/*.js'],
      cwd: 'src',
      dest: 'dist/amd'
    }
  },


  // --------------------------------------------------------------------------
  // WATCH FILES
  // --------------------------------------------------------------------------

  'watch': {
    options: {
      spawn: true
    },
    grunt: {
      files: ['Gruntfile.js'],
      tasks: ['build'],
      options: { livereload: true }
    },
    tests: {
      files: ['test/**/*.*'],
      options: { livereload: true }
    },
    js: {
      files: ['src/**/*.js'],
      tasks: ['build:js'],
      options: { livereload: true }
    }
  },


  // --------------------------------------------------------------------------
  // API / SOCKETS FOR TESTING
  // --------------------------------------------------------------------------

  'process': {
    api: { src: 'test/api/api.js' }
  },


  // --------------------------------------------------------------------------
  // STATIC SERVER
  // --------------------------------------------------------------------------

  'connect': {
    server: {
      options: { base: '', port: 9999 }
    }
  },


  // --------------------------------------------------------------------------
  // TESTS
  // --------------------------------------------------------------------------

  'saucelabs-mocha': {
    all: {
      options: {
        urls: ['http://127.0.0.1:9999/test/_runner.html'],
        build: process.env.TRAVIS_JOB_ID || '<%= pkg.version %>',
        tunnelTimeout: 5,
        concurrency: 3,
        browsers: browsers,
        testname: 'rc-socket'
      }
    }
  },


  // --------------------------------------------------------------------------
  // MOCHA
  // --------------------------------------------------------------------------

  'mocha_phantomjs': {
    all: ['test/_runner.html']
  }


});


// DEFAULT
grunt.registerTask('default', ['build']);

// BUILD
grunt.registerTask('build', ['build:js']);
grunt.registerTask('build:js', ['clean:js', 'jshint:src', 'requirejs', 'umd', 'uglify', 'copy:js', 'nodefy']);

// TEST
grunt.registerTask('test', ['test-local']);
grunt.registerTask('test-local', ['default', 'process:api:start', 'mocha_phantomjs', 'process:api:stop']);
grunt.registerTask('test-sauce', ['jshint', 'connect', 'saucelabs-mocha']);

// DEVELOP
grunt.registerTask('dev', ['build', 'connect', 'watch']);


};