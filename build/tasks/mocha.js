/*!
 * build/tasks/mocha_report.js
 * 
 * Copyright (c) 2015
 */

var fs = require('fs');

/* -----------------------------------------------------------------------------
 * task
 * ---------------------------------------------------------------------------*/

module.exports = function (grunt) {

  // I am bypassing this test when running on Travis.
  // Hitting a Mocha crash on Travis which is not reproducible locally.
  // [see Build 56](https://travis-ci.org/firstopinion/rc-socket.js/builds/96867654)
  //if (process.env.SAUCE_USERNAME !== undefined) {
  //  return;
  //}

  /* ---------------------------------------------------------------------------
   * load
   * -------------------------------------------------------------------------*/

  // `grunt-mocha-test` was previous imported by EasyBuild.
  // This task is merely setting the options.

  var data = JSON.parse(fs.readFileSync('build/sauce.json'));

  var defaults = {
      options: { reporter: 'spec', browserArgument : 'chrome' },
      src: ['test/cross-browser/*.js']
  };

  /* ---------------------------------------------------------------------------
   * config
   * -------------------------------------------------------------------------*/

  var config = {};

  data.browsers.forEach(function(browser, index) {
    var cloned = JSON.parse(JSON.stringify(defaults));
    cloned.options.browserArgument = browser.browserName;

    config[browser.browserName] = cloned;
  });

  grunt.verbose.writeln('Running Selenium tests with the following config');
  grunt.verbose.write(JSON.stringify(config, null, 2));

  grunt.config('mochaTest', config);

};