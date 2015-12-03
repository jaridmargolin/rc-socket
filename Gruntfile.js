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

  // loads library specific tasks
  grunt.loadTasks('build/tasks');

  // Checks if ports 9997 to 9999 inclusive are available
  portscanner.findAPortInUse(9997, 9999, '127.0.0.1', function(error, port) {
    // Status is 'open' if currently in use or 'closed' if available
    if (!error) {
      if (port) {
        throw new Error('Cannot start Services port ' + port + ' is being used.');
      }
    } else {
      console.log('There was an error');
    }
  });

  // easy-build yo!
  easybuild.load(grunt, {
    'test': ['build', 'test:rcsocket'],
    'test:rcsocket': ['process:api:start', 'test:local', 'process:api:stop']
  });

};
