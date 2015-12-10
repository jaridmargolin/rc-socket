/*!
 * test/api/web-socket.js
 * 
 * Copyright (c) 2014
 */

// 3rd party
var WsServer = require('ws').Server;


/* -----------------------------------------------------------------------------
 * web-socket server
 *

 var program = require('commander');

 program.arguments('<type> [tags...]')
 .option('-e, --env [dev|prod|test]', 'Environment wich to run tests against.', 'dev')
 .option('-p, --port [number]', 'Port the application will/is served on.', '8080')
 .action(main)
 .parse(process.argv);

 *
 * ---------------------------------------------------------------------------*/

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/socket-server-debug.log', {flags : 'w'});
var log_stdout = process.stdout;

/* var logger = console.log.bind(console); */
var logger = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};
var _trigger = function (name) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.shift();

  logger.apply(root, ['web-socket', name].concat(args));
};

// Create new WebSocket instance
var wss = new WsServer({ port: 9998 });
_trigger('socketstarted', wss);

// Send Reciept - Essentially just an echo
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    _trigger('onmessage', message);

    if (message === 'test') {
      ws.send(JSON.stringify({ msg: 'receipt' }));
    }
  });
  ws.on('open', function(evt) {
    _trigger('onopen', evt);
  });
  //ws.on('ping', function(evt) {
  //  _trigger('onping', evt);
  //});
  //ws.on('pong', function(evt) {
  //  _trigger('onpong', evt);
  //});
  //ws.on('error', function(evt) {
  //  _trigger('onerror', evt);
  //});
  ws.on('close', function(evt) {
    _trigger('onclose', evt);
  });
  ///* ---------------------------------
  // * open
  // * -------------------------------*/
  //this.ws.onopen = function (evt) {
  //  clearTimeout(timeout);
  //
  //  // Fix error where close is explicitly called
  //  // but onopen event is still triggered
  //  if (this.forced) {
  //    return this.close();
  //  }
  //
  //  hasConnected = true;
  //  this.attempts = 1;
  //  this._stateChanged('OPEN', 'onopen', evt);
  //  this._sendQueued();
  //}.bind(this);
  //
  ///* ---------------------------------
  // * close
  // * -------------------------------*/
  //this.ws.onclose = function (evt) {
  //  clearTimeout(timeout);
  //
  //  this.ws = null;
  //  if (this.forced) {
  //    this._stateChanged('CLOSED', 'onclose', evt);
  //  } else if (!this.unload) {
  //    this._reconnect(evt, hasConnected);
  //  }
  //}.bind(this);
  //
  ///* ---------------------------------
  // * message
  // * -------------------------------*/
  //this.ws.onmessage = function (evt) {
  //  this._trigger('onmessage', evt);
  //}.bind(this);
  //
  ///* ---------------------------------
  // * error
  // * -------------------------------*/
  //this.ws.onerror = function (evt) {
  //  this._trigger('onerror', evt);
  //}.bind(this);
});

// On clean shut down - close
process.on( 'SIGINT', function() {
  wss.close();
  _trigger('socketended');
  process.exit();
});