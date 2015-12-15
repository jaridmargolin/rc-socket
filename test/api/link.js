/*!
 * test/api/web-socket.js
 * 
 * Copyright (c) 2014
 */

/* -----------------------------------------------------------------------------
 * link proxy
 * ---------------------------------------------------------------------------*/

var net = require('net');

var sourceport = 9998;
var destport = 9995;

net.createServer(function(s)
{
  var buff = '';
  var connected = false;
  var cli = net.createConnection(destport);
  s.on('data', function(d) {
    if (connected)
    {
      cli.write(d);
    } else {
      buff += d.toString();
    }
  });
  cli.on('connect', function() {
    console.log('hello!');
    connected = true;
    cli.write(buff);
  });
  cli.pipe(s);
}).listen(sourceport);