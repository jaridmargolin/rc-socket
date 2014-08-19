/*!
 * rc-socket.js:
 * 
 * Copyright (c) 2014
 * Originally adapted from: https://github.com/joewalnes/reconnecting-websocket
 */




/* -----------------------------------------------------------------------------
 * scope
 * ---------------------------------------------------------------------------*/

var root = this;


/* -----------------------------------------------------------------------------
 * RcSocket
 * ---------------------------------------------------------------------------*/

/**
 * This behaves like a WebSocket in every way, except if it fails to connect,
 * or it gets disconnected, it will use an exponential backoff until it
 * succesfully connects again.
 *
 * It is API compatible with the standard WebSocket API.
 *
 * @example
 * var ws = new ReconnectingWebsocket(wss://host);
 *
 * @public
 * @constructor
 * @param {String} url - Url to connect to.
 * @param {String|Array} protocols - Optional subprotocols.
 */
var RcSocket = function (url, protocols) {
  // Defaults
  this.debug    = false;
  this.timeout  = 2500;
  this.maxRetry = 1000;
  this.logger   = console.debug;

  // State
  this.unload   = false;
  this.forced   = false;
  this.timedOut = false;
  this.attempts = 1;
  this.queue    = [];

  // Instance vars
  this.protocols = protocols;
  this.URL = url;

  // Hack to fix firefox triggering close on leave
  window.onbeforeunload = function () {
    this.unload = true;
  }.bind(this);

  // Connect dAwG! - delay to add handlers
  setTimeout(this.connect.bind(this), 0);
};


/**
 * Wrapper around websocket.
 *
 * @private
 * @param {Number} reconnectAttempt - Name of event to fire.
 */
RcSocket.prototype.connect = function () {
  // New connecting websocket
  if (this.protocols) {
    this.ws = new WebSocket(this.URL, this.protocols);
  } else {
    this.ws = new WebSocket(this.URL);
  }
  
  // Update
  this._stateChanged('CONNECTING', 'onconnecting');

  // Start timer
  var rcAttempt = true,
      timeout   = this._setTimeout(this.ws);

  /* ---------------------------------
   * open
   * -------------------------------*/
  this.ws.onopen = function (evt) {
    clearTimeout(timeout);

    rcAttempt = false;
    this.attempts = 1;
    this._stateChanged('OPEN', 'onopen', evt);
    this._sendQueued();
  }.bind(this);
    
  /* ---------------------------------
   * close
   * -------------------------------*/
  this.ws.onclose = function (evt) {
    clearTimeout(timeout);

    this.ws = null;
    if (this.forced) {
      this._stateChanged('CLOSED', 'onclose', evt);
    } else if (!this.unload) {
      this._reconnect(evt, rcAttempt);
    }
  }.bind(this);

  /* ---------------------------------
   * message
   * -------------------------------*/
  this.ws.onmessage = function (evt) {
    this._trigger('onmessage', evt);
  }.bind(this);

  /* ---------------------------------
   * error
   * -------------------------------*/
  this.ws.onerror = function (evt) {
    this._trigger('onerror', evt);
  }.bind(this);
};


/**
 * Wrapper around ws.send that adds data to queue if socket is not ready.
 *
 * @public
 * @param {Object} data - data to send via web socket.
 */
RcSocket.prototype.send = function (data) {
  // If ready to send
  if (this.ws && this.readyState) {
    return this.ws.send(data);
  }

  // Else queue
  this.queue.push(data);
};


/**
 * Function to generate interval using exponential backoff
 *
 * @public
 */
RcSocket.prototype.close = function () {
  this.forced = true;

  if (this.ws) {
    this.ws.close();
  }
};


/**
 * Additional public API method to refresh the connection if still open
 * (close, re-open). For example, if the app suspects bad data / missed heart
 * beats, it can try to refresh.
 *
 * @public
 */
RcSocket.prototype.refresh = function() {
  if (this.ws) {
    this.ws.close();
  }
};


/**
 * Set timeout on websocket.
 *
 * @private
 * @param {Object} localWs - Websocket object to set timeout on.
 */
RcSocket.prototype._setTimeout = function (ws) {
  return setTimeout(function() {
    this._trigger('ontimeout');
    this.timedOut = true;
    ws.close();
    this.timedOut = false;
  }.bind(this), this.timeout);
};


/**
 * Wrapper around ws.send that adds data to queue if socket is not ready.
 *
 * @public
 * @param {Object} data - data to send via web socket.
 */
RcSocket.prototype._reconnect = function (evt, rcAttempt) {
  // Was open at some point so we need to trigger close evts
  if (!rcAttempt && !this.timedOut) {
    this._trigger('onclose', evt);
  }

  // Reconnect
  setTimeout(this.connect.bind(this), this._getInterval());
};


/**
 * Loop over all queued messages and send.
 *
 * @private
 */
RcSocket.prototype._sendQueued = function () {
  for (var i = 0, l = this.queue.length; i < l; i++) {
    this.send(this.queue[i]);
  }

  this.queue = [];
};


/**
 * Update state, log, trigger.
 *
 * @private
 * @param {String} state - String representing WebSocket.
 * @param {String} name - String of the event name.
 * @param {Object} evt - Event object.
 */
RcSocket.prototype._stateChanged = function (state) {
  this.readyState = WebSocket[state];

  var args = Array.prototype.slice.call(arguments, 0);
  this._trigger.apply(this, args.slice(1, args.length));
};


/**
 * Convenience method for semantically calling handlers.
 *
 * @private
 * @param {String} name - Name of event to fire.
 */
RcSocket.prototype._trigger = function (name) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.shift();

  // Log
  if (this.debug || RcSocket.debugAll) {
    this.logger.apply(root, ['RcSocket', name, this.URL].concat(args));
  }

  // Trigger
  if (this[name]) {
    this[name].apply(root, args);
  }
};


/**
 * Function to generate interval using exponential backoff.
 *
 * @private
 * @returns {Number}
 */
RcSocket.prototype._getInterval = function () {
  var interval    = (Math.pow(2, this.attempts) - 1) * 1000;
  
  // Another attempt
  this.attempts ++;
  return (interval > this.maxRetry) ? this.maxRetry : interval;
};


/**
 * Setting this to true is the equivalent of setting all instances of
 * RcSocket.debug to true.
 */
RcSocket.debugAll = false;


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

module.exports = RcSocket;


