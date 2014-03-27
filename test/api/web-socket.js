/*
 * test/api/web-socket.js:
 *
 * (C) 2014 First Opinion
 * MIT LICENCE
 *
 */


// ----------------------------------------------------------------------------
// Dependencies
// ----------------------------------------------------------------------------

// 3rd party
var WsServer = require('ws').Server;


// ----------------------------------------------------------------------------
// WebSocket Server
// ----------------------------------------------------------------------------

// Create new WebSocket instance
var wss = new WsServer({ port: 9998 });

// Send Reciept - Essentially just an echo
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    ws.send(JSON.stringify({ msg: 'reciept' }));
  });
});

// On clean shut down - close
process.on( 'SIGINT', function() {
  wss.close();
  process.exit();
});