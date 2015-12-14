/*!
 * Gruntfile.js
 * 
 * Copyright (c) 2014
 */

// 3rd party
var easybuild = require('easy-build'),
    portscanner = require('portscanner');

/* -----------------------------------------------------------------------------
 * easy-build
 * ---------------------------------------------------------------------------*/

module.exports = function (grunt) {

  // Checks if ports 9997 to 9999 inclusive are available
  portscanner.findAPortInUse(9997, 9999, '127.0.0.1', function(error, port) {
    // Status is 'open' if currently in use or 'closed' if available
    if (!error && port) {
        throw new Error('Cannot start Services port ' + port + ' is being used.');
    }
  });

  // easy-build yo!
  easybuild.load(grunt, {
    'test:local:prehook': ['process:api:start'],
    'test:local:posthook': ['process:api:stop'],

    'test:sauce:prehook' : ['process:api:start'],
    'test:sauce:posthook' : ['process:api:stop'],

    'dev:prehook': ['process:api:start'],
    'dev:posthook': ['process:api:stop'],

    'test:crossbrowser' : ['build', 'assemble', 'connect', 'sauce_tunnel', 'mochaTest', 'sauce_tunnel_stop']
  });

  // loads library specific tasks
  grunt.loadTasks('build/tasks');

};
