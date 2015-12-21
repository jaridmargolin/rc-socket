/*!
 * test/api/link.js
 * 
 * Copyright (c) 2014
 */

// Core
var net = require('net');
var util = require('util');

var dropRate = 0;  // ranges from 0 to 100

/* -----------------------------------------------------------------------------
 * process piping
 * ---------------------------------------------------------------------------*/

var stdin = process.stdin;
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
  var command = JSON.parse(chunk);

  if (command.op === 'drop') {
    dropRate = command.rate;
    console.log('Setting ' + command.op + ' to ' + command.rate);
  }
});

/* -----------------------------------------------------------------------------
 * custom pipe stream, which will introduce drops
 * ---------------------------------------------------------------------------*/

var Transform = require('stream').Transform;

function Valve(options) {
  // allow use without new
  if (!(this instanceof Valve)) {
    return new Valve(options);
  }

  // init Transform
  Transform.call(this, options);
}
util.inherits(Valve, Transform);

Valve.prototype._transform = function (chunk, enc, done) {
  // set a hard drop if the rate is exactly 100
  if (dropRate === 100 || dropRate / 100.0 > Math.random()) {
    done();
  } else {
    // pass along the chunk
    done(null, chunk);
  }
};


/* -----------------------------------------------------------------------------
 * link proxy
 * ---------------------------------------------------------------------------*/

// Enhanced from http://stackoverflow.com/a/19637388 //
var addr = {
  to: '9995',
  from: '9998'
};

net.createServer(function(from) {
  var upstream = new Valve();
  var downstream = new Valve();

  var to = net.createConnection({
    host: 'localhost',
    port: addr.to
  });

  to.pipe(upstream);
  upstream.pipe(from);

  from.pipe(downstream);
  downstream.pipe(to);

}).listen(addr.from, 'localhost');
