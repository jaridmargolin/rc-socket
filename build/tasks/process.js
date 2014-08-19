/*!
 * build/tasks/process.js
 * 
 * Copyright (c) 2014
 */

// core
var spawn = require('child_process').spawn;
var path  = require('path');


/* -----------------------------------------------------------------------------
 * task
 * ---------------------------------------------------------------------------*/

module.exports = function (grunt) {

  /* ---------------------------------------------------------------------------
   * register
   * -------------------------------------------------------------------------*/

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


  /* ---------------------------------------------------------------------------
   * config
   * -------------------------------------------------------------------------*/

  grunt.config('process', {
    api: {
      src: 'test/api/api.js'
    }
  });

};