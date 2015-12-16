/*!
 * test/api/link.js
 * 
 * Copyright (c) 2014
 */


/* -----------------------------------------------------------------------------
 * process piping
 * ---------------------------------------------------------------------------*/

var stdin = process.stdin,
    inputChunks = [],
    opts = {};

//stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
  inputChunks.push(chunk);
});

stdin.on('end', function () {
  var inputJSON = inputChunks.join(),
      parsedData = JSON.parse(inputJSON),
      outputJSON = JSON.stringify(parsedData, null, '    ');

  opts = outputJSON;
});


/* -----------------------------------------------------------------------------
 * link proxy
 * ---------------------------------------------------------------------------*/

var net = require('net');

//// http://stackoverflow.com/a/19637388 ////

var addrRegex = /^(([a-zA-Z\-\.0-9]+):)?(\d+)$/;

var addr = {
  to: addrRegex.exec('localhost:9995'),
  from: addrRegex.exec('localhost:9998')
};

net.createServer(function(from) {
  var to = net.createConnection({
    host: addr.to[2],
    port: addr.to[3]
  });
  from.pipe(to);
  to.pipe(from);
}).listen(addr.from[3], addr.from[2]);