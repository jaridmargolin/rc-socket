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
    var socketPath = path.join(__dirname, 'web-socket.js');
    socketProcess = spawn('node', [socketPath], { stdio: 'inherit' });

    // start the link-layer after the socket service starts listening,
    // as the link-layer requires a socket to bind to
    var linkPath = path.join(__dirname, 'link.js');
    linkProcess = spawn('node', [linkPath], { stdio: ['pipe', process.stdout, process.stderr] });
    linkProcess.stdin.setEncoding('utf-8');

    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/socket/stop',
  handler: function (request, reply) {
    socketProcess.kill('SIGINT');
    linkProcess.kill('SIGINT');
    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/link/start',
  handler: function (request, reply) {
    var filePath = path.join(__dirname, 'link.js');
    linkProcess = spawn('node', [filePath]);
    linkProcess.stdin.setEncoding('utf-8');

    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/link/stop',
  handler: function (request, reply) {
    linkProcess.kill('SIGINT');
    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/link/down',
  handler: function (request, reply) {
    var cmd = {
      op: 'drop',
      drop: 100        // tell the link to drop all packets
    };
    linkProcess.stdin.write(JSON.stringify(cmd));
    reply().code(204);
  }
});

server.route({
  method: 'POST',
  path: '/link/lossy',
  handler: function (request, reply) {
    var cmd = {
      op: 'drop',
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