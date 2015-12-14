/*!
 * build/tasks/mocha_report.js
 * 
 * Copyright (c) 2015
 */


/* -----------------------------------------------------------------------------
 * task
 * ---------------------------------------------------------------------------*/

module.exports = function (grunt) {

  /* ---------------------------------------------------------------------------
   * load
   * -------------------------------------------------------------------------*/

  // `grunt-mocha-test` was previous imported by EasyBuild.
  // This task is merely setting the options.


  /* ---------------------------------------------------------------------------
   * config
   * -------------------------------------------------------------------------*/

  grunt.config('mochaTest', {
    chrome: {
      options: { reporter: 'spec', browserArgument : 'chrome' },
      src: ['test/cross-browser/*.js']
    },
    //firefox: {
    //},
    //safari:
  });

};