/*!
 * test/api/link.js
 * 
 * Copyright (c) 2014
 */

// Core
var net = require('net');

/* -----------------------------------------------------------------------------
 * process piping
 * ---------------------------------------------------------------------------*/

var stdin = process.stdin,
    inputChunks = [],
    opts = {};

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

//TODO create a custom pipe stream, which will introduce drops

/* -----------------------------------------------------------------------------
 * link proxy
 * ---------------------------------------------------------------------------*/

//// http://stackoverflow.com/a/19637388 ////
var addr = {
  to: '9995',
  from: '9998'
};

net.createServer(function(from) {
  var to = net.createConnection({
    host: 'localhost',
    port: addr.to
  });
  from.pipe(to);
  to.pipe(from);
}).listen(addr.from, 'localhost');