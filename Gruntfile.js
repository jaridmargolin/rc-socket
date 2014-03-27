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
  { browserName: 'safari', platform: 'OS X 10.8' },
  { browserName: 'safari', platform: 'OS X 10.9' }
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

  if (this.args.shift() == 'stop' && proc) {
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
      'dist/*.js',
      '!dist/*.min.js'
    ],
    options: {
      force: true,
      es3: true,
      smarttabs: true,
      // Bad line breaking before '?'.
      '-W014': true,
      // Expected a conditional expression and instead saw an assignment.
      '-W084': true,
      // Is better written in dot notation.
      '-W069': true
    }
  },

  // --------------------------------------------------------------------------
  // CLEAN (EMPTY DIRECTORY)
  // --------------------------------------------------------------------------
  'clean': ['dist'],

  // --------------------------------------------------------------------------
  // REQUIREJS BUILD
  // --------------------------------------------------------------------------
  'requirejs': {
    compile: {
      options: {
        name: 'rc-socket',
        baseUrl: 'src',
        out: 'dist/rc-socket.js',
        optimize: 'none',
        skipModuleInsertion: true,
        onBuildWrite: function(name, path, contents) {
          return require('amdclean').clean({
            code: contents,
            prefixMode: 'camelCase',
            escodegen: {
              format: {
                indent: { style: '  ' }
              }
            }
          });
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
      template: 'src/tmpls/umd.hbs',
      dest: 'dist/umd/rc-socket.js'
    },
    amd: {
      src: 'dist/rc-socket.js',
      objectToExport: 'rcSocket',
      globalAlias: 'RcSocket',
      template: 'src/tmpls/amd.hbs',
      dest: 'dist/amd/rc-socket.js'
    },
    common: {
      src: 'dist/rc-socket.js',
      objectToExport: 'rcSocket',
      globalAlias: 'RcSocket',
      template: 'src/tmpls/common.hbs',
      dest: 'dist/common/rc-socket.js'
    },
    standalone: {
      src: 'dist/rc-socket.js',
      objectToExport: 'rcSocket',
      globalAlias: 'RcSocket',
      template: 'src/tmpls/standalone.hbs',
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

// Tasks    
grunt.registerTask('default', ['jshint:src', 'clean', 'requirejs', 'umd:umd', 'umd:amd', 'umd:common', 'umd:standalone', 'uglify', 'jshint:build']);
grunt.registerTask('test-local', ['default', 'process:api:start', 'mocha_phantomjs', 'process:api:stop']);
grunt.registerTask('test', ['default', 'connect', 'saucelabs-mocha']);


};