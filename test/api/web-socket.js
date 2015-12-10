/*!
 * test/api/web-socket.js
 * 
 * Copyright (c) 2014
 */

// 3rd party
var WsServer = require('ws').Server;


/* -----------------------------------------------------------------------------
 * web-socket server
 * ---------------------------------------------------------------------------*/

// Create new WebSocket instance
var wss = new WsServer({ port: 9998 });

// Send Reciept - Essentially just an echo
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    if (message === 'test') {
      ws.send(JSON.stringify({ msg: 'receipt' }));
    }
  });
});

// On clean shut down - close
process.on( 'SIGINT', function() {
  wss.close();
  process.exit();
});