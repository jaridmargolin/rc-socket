/*!
 * test/commands/api.js
 * 
 * Copyright (c) 2014
 */

// Core
var spawn = require('child_process').spawn,
    path  = require('path');

// 3rd party
var Hapi = require('hapi');


/* -----------------------------------------------------------------------------
 * scope
 * ---------------------------------------------------------------------------*/

var socketProcess;
var linkProcess;


/* -----------------------------------------------------------------------------
 * api
 * ---------------------------------------------------------------------------*/
var server = Hapi.createServer('localhost', 9997, { cors: true });

server.route({
  method: 'POST',
  path: '/socket/start',
  handler: function (request, reply) {
    var filePath = path.join(__dirname, 'web-socket.js');
    socketProcess = spawn('node', [filePath]);
    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/socket/stop',
  handler: function (request, reply) {
    socketProcess.kill('SIGINT');
    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/link/up',
  handler: function (request, reply) {
    var filePath = path.join(__dirname, 'link.js');
    linkProcess = spawn('node', [filePath]);

    linkProcess.stdin.setEncoding('utf-8');
    //linkProcess.stdout.pipe(process.stdout);

    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/link/down',
  handler: function (request, reply) {
    linkProcess.kill('SIGINT');
    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/link/drops',
  handler: function (request, reply) {
    var cmd = {
      drop: 5        // tell the link to drop 5% of packets
    };
    linkProcess.stdin.write(JSON.stringify(cmd));
    reply().code(204);
  }
});

// Gracefully shutdown if websocket started
process.on('SIGINT', function () {
  if (socketProcess) {
    socketProcess.kill('SIGINT');
  }
  if (linkProcess) {
    linkProcess.kill('SIGINT');
  }
  process.exit();
});

// Start the server
server.start();