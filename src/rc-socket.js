/*!
 * rc-socket.js:
 * 
 * Copyright (c) 2014
 * Originally adapted from: https://github.com/joewalnes/reconnecting-websocket
 */

define(function () {


/* -----------------------------------------------------------------------------
 * scope
 * ---------------------------------------------------------------------------*/

var root = this;


/* -----------------------------------------------------------------------------
 * export false if WebSocket is hixie
 * http://stackoverflow.com/questions/17849517/check-to-see-if-websocket-is-hixie-client-side
 * ---------------------------------------------------------------------------*/

// if (window.WebSocket && (WebSocket.CLOSED === 3 || WebSocket.prototype.CLOSED === 3)) {
//   return false;
// }


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
  this.delay    = 100;
  this.logger   = console.debug;

  // State
  this.hasUnloaded  = false;
  this.hasOpened    = false;
  this.wasForced    = false;
  this.isRetrying   = false;
  this.isRefreshing = false;
  this.attempts     = 1;
  this.queue        = [];

  // Instance vars
  this.protocols = protocols;
  this.URL = url;

  // Hack to fix firefox triggering close on leave
  window.onbeforeunload = function () {
    this.hasUnloaded = true;
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
  
  // Attach an id to the internal web socket. Could be use for various reasons
  // but initially being introduced for debugging purposes.
  this.ws.id = Date.now();

  // Update
  this._stateChanged('CONNECTING', 'onconnecting');

  // Start timer
  this.connectTimer = setTimeout(function() {
    this._trigger('ontimeout');
    this.retry();
  }.bind(this), this.timeout);

  /* ---------------------------------
   * open
   * -------------------------------*/
  this.ws.onopen = function (evt) {
    clearTimeout(this.connectTimer);

    // Fix error where close is explicitly called
    // but onopen event is still triggered
    if (this.wasForced) {
      return this.close();
    }
    
    this.hasOpened = true;
    this.attempts = 1;
    this._stateChanged('OPEN', 'onopen', evt);
    this._sendQueued();
  }.bind(this);
    
  /* ---------------------------------
   * close
   * -------------------------------*/
  this.ws.onclose = function (evt) {
    clearTimeout(this.connectTimer);
    this.ws = null;

    // Because RcSocket holds state we can pass additional information to
    // upstream handlers regarding why the socket was closed.
    evt.forced = this.wasForced;
    evt.isRetrying = this.isRetrying;
    evt.isRefreshing = this.isRefreshing;

    // Immediately change state and exit on force close.
    if (this.wasForced) {
      this._stateChanged('CLOSED', 'onclose', evt);

    // Hack P2: Safegaurd against firefox behavior where close event is
    // triggered on page navigation and results in an attempted reconnect.
    } else if (!this.hasUnloaded) {
      // Was open at some point so we need to trigger close evts
      // TODO: Wondering it state change should ALWAYS BE CALLED?
      if (this.hasOpened) {
        this._trigger('onclose', evt);
      }

      this.isRetrying = false;
      this.isRefreshing = false;
      this.hasOpened = false;
      this._reconnect();
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

  // Else queue - We are adding to the end of the array
  // so that when we send queued messages we can loop through
  // in reverse and remove queued as we go.
  this.queue.unshift(data);
};


/**
 * Function to generate interval using exponential backoff
 *
 * @public
 */
RcSocket.prototype.close = function () {
  this.wasForced = true;
  this._close();
};


/**
 * Additional public API method to refresh the connection if still open
 * (close, re-open). For example, if the app suspects bad data / missed heart
 * beats, it can try to refresh.
 *
 * @public
 */
RcSocket.prototype.retry = function() {
  this.isRetrying = true;
  this._close();
};


/**
 * Additional public API method to refresh the connection if still open
 * (close, re-open). For example, if the app suspects bad data / missed heart
 * beats, it can try to refresh.
 *
 * @public
 */
RcSocket.prototype.refresh = function() {
  this.isRefreshing = true;
  this._close();
};


/**
 * Additional public API method to refresh the connection if still open
 * (close, re-open). For example, if the app suspects bad data / missed heart
 * beats, it can try to refresh.
 *
 * @public
 */
RcSocket.prototype._close = function() {
  if (this.ws) {
    this.ws.close();
  }
};


/**
 * Wrapper around ws.send that adds data to queue if socket is not ready.
 *
 * @public
 * @param {Object} data - data to send via web socket.
 */
RcSocket.prototype._reconnect = function (evt) {
  var interval = (Math.pow(2, this.attempts) - 1) * 1000;
  interval = (interval > this.maxRetry) ? this.maxRetry : interval;

  this.attempts ++;
  setTimeout(this.connect.bind(this), interval);
};


/**
 * Loop over all queued messages and send.
 *
 * @private
 */
RcSocket.prototype._sendQueued = function () {
  var l = this.queue.length;
      i = l;

  while (i--) {
    this._delayQueueSend(i, l - i);
  }
};


/**
 * Send delayed message to avoid timing
 * issues when sending queued.
 *
 * @private
 *
 * @param - Id/order of message to send.
 */
RcSocket.prototype._delayQueueSend = function (i, d) {
  var delay = this.delay * d;
  
  setTimeout(function () {
    this.send(this.queue[i]);
    this.queue.pop();
  }.bind(this), delay);
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
 * Setting this to true is the equivalent of setting all instances of
 * RcSocket.debug to true.
 */
RcSocket.debugAll = false;


/* -----------------------------------------------------------------------------
 * export
 * ---------------------------------------------------------------------------*/

return RcSocket;


});