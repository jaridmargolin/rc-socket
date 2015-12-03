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
    'test:rcsocket': ['process:api:start', 'test:local', 'process:api:stop']
  });

};
