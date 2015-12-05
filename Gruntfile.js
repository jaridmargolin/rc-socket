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
    'test:local:prehook': ['process:api:start'],
    'test:local:posthook': ['process:api:stop'],

    'test:sauce:prehook' : ['process:api:start'],
    'test:sauce:posthook' : ['process:api:stop'],

    'dev:prehook': ['process:api:start'],
    'dev:posthook': ['process:api:stop'],
  });

};
