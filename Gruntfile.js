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
    'test:local': ['assemble', 'process:api:start', 'mocha_phantomjs', 'process:api:stop']
  });

};