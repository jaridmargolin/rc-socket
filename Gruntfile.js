/*!
 * Gruntfile.js
 * 
 * Copyright (c) 2014
 */

// 3rd party
var easybuild = require('easy-build');


/* -----------------------------------------------------------------------------
 * easy-build
 * ---------------------------------------------------------------------------*/

module.exports = function (grunt) {

  // loads library specific tasks
  grunt.loadTasks('build/tasks');

  // easy-build yo!
  easybuild.load(grunt, {
    'test': ['build', 'test:rcsocket'],
    'test:rcsocket': ['process:api:start', 'test:local', 'process:api:stop'],
    'dev': ['build', 'process:api:start', 'assemble', 'connect', 'watch', 'process:api:stop'],
    'sauce:correct': ['assemble', 'process:api:start', 'connect', 'saucelabs-mocha', 'process:api:stop']
  });

};
