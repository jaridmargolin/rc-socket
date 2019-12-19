var $ = require('../internals/export');
var forEach = require('../internals/array-for-each');

// `Array.prototype.forEach` method
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
$({ target: 'Array', proto: true, forced: [].forEach != forEach }, {
  forEach: forEach
});

var redefine = require('../internals/redefine');

var DatePrototype = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var nativeDateToString = DatePrototype[TO_STRING];
var getTime = DatePrototype.getTime;

// `Date.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-date.prototype.tostring
if (new Date(NaN) + '' != INVALID_DATE) {
  redefine(DatePrototype, TO_STRING, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
  });
}

var $$1 = require('../internals/export');
var assign = require('../internals/object-assign');

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
$$1({ target: 'Object', stat: true, forced: Object.assign !== assign }, {
  assign: assign
});

var global = require('../internals/global');
var DOMIterables = require('../internals/dom-iterables');
var forEach$1 = require('../internals/array-for-each');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach$1) try {
    createNonEnumerableProperty(CollectionPrototype, 'forEach', forEach$1);
  } catch (error) {
    CollectionPrototype.forEach = forEach$1;
  }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/* globals WebSocket:true */
var RcSocketReadyState;

(function (RcSocketReadyState) {
  RcSocketReadyState[RcSocketReadyState["CONNECTING"] = 0] = "CONNECTING";
  RcSocketReadyState[RcSocketReadyState["OPEN"] = 1] = "OPEN";
  RcSocketReadyState[RcSocketReadyState["CLOSING"] = 2] = "CLOSING";
  RcSocketReadyState[RcSocketReadyState["CLOSED"] = 3] = "CLOSED";
})(RcSocketReadyState || (RcSocketReadyState = {}));

var RcSocketCloseType;

(function (RcSocketCloseType) {
  RcSocketCloseType[RcSocketCloseType["FORCE"] = 0] = "FORCE";
  RcSocketCloseType[RcSocketCloseType["KILL"] = 1] = "KILL";
  RcSocketCloseType[RcSocketCloseType["RETRY"] = 2] = "RETRY";
})(RcSocketCloseType || (RcSocketCloseType = {}));

var RcSocketEventName;

(function (RcSocketEventName) {
  RcSocketEventName["CONNECTING"] = "onconnecting";
  RcSocketEventName["TIMEOUT"] = "ontimeout";
  RcSocketEventName["ERROR"] = "onerror";
  RcSocketEventName["OPEN"] = "onopen";
  RcSocketEventName["MESSAGE"] = "onmessage";
  RcSocketEventName["CLOSING"] = "onclosing";
  RcSocketEventName["CLOSE"] = "onclose";
})(RcSocketEventName || (RcSocketEventName = {}));

/* -----------------------------------------------------------------------------
 * RcSocket
 * -------------------------------------------------------------------------- */
var RcSocket =
/*#__PURE__*/
function () {
  // configuration
  // handlers
  // public state
  // protected state

  /**
   * @constructor
   * @name RcSocket
   * @desc This behaves like a WebSocket in every way, except if it fails to
   * connect, or it gets disconnected, it will use an exponential backoff until
   * it succesfully connects again.
   *
   * It is API compatible with the standard WebSocket API.
   *
   * @example
   * const ws = new RcSocket(wss://host)
   *
   * @param url - Url to connect to.
   * @param protocols - Optional subprotocols.
   */
  function RcSocket(url, protocols, settings) {
    var _this = this;

    _classCallCheck(this, RcSocket);

    _defineProperty(this, "settings", {
      debug: RcSocket.defaultSettings.debug,
      logger: RcSocket.defaultSettings.logger,
      connectionTimeout: RcSocket.defaultSettings.connectionTimeout,
      connectionMaxRetryInterval: RcSocket.defaultSettings.connectionMaxRetryInterval
    });

    _defineProperty(this, "url", void 0);

    _defineProperty(this, "protocols", void 0);

    _defineProperty(this, "onclose", null);

    _defineProperty(this, "onerror", null);

    _defineProperty(this, "onmessage", null);

    _defineProperty(this, "onopen", null);

    _defineProperty(this, "ontimeout", null);

    _defineProperty(this, "onconnecting", null);

    _defineProperty(this, "onclosing", null);

    _defineProperty(this, "readyState", RcSocketReadyState.CONNECTING);

    _defineProperty(this, "queue", []);

    _defineProperty(this, "_ws", null);

    _defineProperty(this, "_attempts", 1);

    _defineProperty(this, "_shouldReopen", false);

    _defineProperty(this, "_closeType", null);

    _defineProperty(this, "_connectTimer", null);

    this.url = url;
    this.protocols = protocols; // Mixin instance defined settings

    Object.assign(this.settings, settings); // Delay connect so that we can immediately add socket handlers.

    setTimeout(function () {
      return _this.open();
    }, 0);
  }
  /**
   * @desc Sets initial websocket state and connects. Useful for situations
   * where you want to close the socket and reopen it at a later time.
   *
   * @example
   * socket.close()
   * socket.open()
   */


  _createClass(RcSocket, [{
    key: "open",
    value: function open() {
      if (!this.readyState || this.readyState > WebSocket.CLOSING) {
        this.reset();

        this._connect();
      } else if (this.readyState === WebSocket.CLOSING) {
        this._shouldReopen = true;
      }
    }
    /**
     * @desc Wrapper around ws.send that adds queue functionality when socket is
     *   not in a connected readyState.
     *
     * @example
     * socket.send({ prop: 'val' })
     *
     * @param data - data to send via web socket.
     */

  }, {
    key: "send",
    value: function send(data) {
      // If the queue is actively being process we will move this send to be
      // processed within the queue cycle.
      return this.readyState === WebSocket.OPEN ? this._send(data) : this.queue.push(data);
    }
    /**
     * @desc Explicitly close socket. Overrides default RcSocket reconnection logic.
     *
     * @example
     * socket.close()
     */

  }, {
    key: "close",
    value: function close() {
      this._close(RcSocketCloseType.FORCE);
    }
    /**
     * @desc Hard kill by cleaning up all handlers.
     *
     * @example
     * socket.kill()
     */

  }, {
    key: "kill",
    value: function kill() {
      this._close(RcSocketCloseType.KILL);

      this.reset();
    }
    /**
     * @desc Refresh the connection if open (close, re-open). If the app suspects
     *   the socket is stale (occurs when changing from wifi -> carrier or vice
     *   versa), this method will close the existing socket and reconnect.
     *
     * @example
     * socket.reboot()
     */

  }, {
    key: "reboot",
    value: function reboot() {
      this.kill();

      this._connect();
    }
    /**
     * @desc Reset socket to initial state.
     *
     * @example
     * socket.reset()
     */

  }, {
    key: "reset",
    value: function reset() {
      this._stop();

      if (this._ws) {
        this._ws.onopen = null;
        this._ws.onclose = null;
        this._ws.onmessage = null;
        this._ws.onerror = null;
      }

      this._ws = null;
      this.readyState = RcSocketReadyState.CONNECTING;
      this._closeType = null;
      this._shouldReopen = false;
      this._attempts = 1;
    }
    /* ---------------------------------------------------------------------------
     * WebSocket Management
     * ------------------------------------------------------------------------ */

    /**
     * @desc Wrapper around WebSocket creation. By wrapping the raw WebSocket we
     *   have the opportunity to manipulate events, change behavior (like adding
     *   reconnection logic), and then finally proxy the events as if we were a
     *   the actual socket.
     */

  }, {
    key: "_connect",
    value: function _connect() {
      var _this2 = this;

      this._ws = Object.assign(new WebSocket(this.url, this.protocols), {
        id: Date.now()
      });
      this._ws.onopen = this._onopen.bind(this);
      this._ws.onclose = this._onclose.bind(this);
      this._ws.onmessage = this._onmessage.bind(this);
      this._ws.onerror = this._onerror.bind(this); // Rather than letting the websocket set indefinetely, we close the socket
      // after a specified timeout. The close will automatically handle retrying.

      this._connectTimer = setTimeout(function () {
        _this2._trigger(RcSocketEventName.TIMEOUT);

        _this2._close(RcSocketCloseType.RETRY);
      }, this.settings.connectionTimeout);

      this._stateChanged(RcSocketReadyState.CONNECTING, RcSocketEventName.CONNECTING);
    }
    /**
     * @desc Stop all async code from executing. Used internally anytime a socket
     * is either manually closed, or interpretted as closed
     */

  }, {
    key: "_stop",
    value: function _stop() {
      if (this._connectTimer) {
        clearTimeout(this._connectTimer);
        this._connectTimer = null;
      }
    }
    /**
     * @desc Timeout cleanup, state management, and queue handling.
     *
     * @param evt - WebSocket onopen evt.
     */

  }, {
    key: "_onopen",
    value: function _onopen(evt) {
      if (this._connectTimer) {
        clearTimeout(this._connectTimer);
        this._connectTimer = null;
      } // Fix error where close is explicitly called but onopen event is still
      // triggered.


      if (this._closeType === RcSocketCloseType.FORCE) {
        return this.close();
      }

      this._attempts = 1;

      this._stateChanged(RcSocketReadyState.OPEN, RcSocketEventName.OPEN, evt);

      this._sendQueued();
    }
    /**
     * @desc Responsible for interpretting the various possible close types (force,
     *   retry, etc...) and reconnecting/proxying events accordingly.
     *
     * @param evt - WebSocket onclose evt.
     */

  }, {
    key: "_onclose",
    value: function _onclose(evt) {
      this._stop();

      this._ws = null; // Immediately change state and exit on force close.

      if (this._closeType === RcSocketCloseType.FORCE) {
        this._stateChanged(RcSocketReadyState.CLOSED, RcSocketEventName.CLOSE, Object.assign(evt, {
          forced: true
        }));

        if (this._shouldReopen) {
          this.open();
        }
      } else {
        if (this._closeType !== RcSocketCloseType.RETRY) {
          this._trigger(RcSocketEventName.CLOSE, evt);
        }

        this._reconnect();
      }
    }
    /**
     * @desc Simple proxy for onmessage event.
     *
     * @param evt - WebSocket onmessage evt.
     */

  }, {
    key: "_onmessage",
    value: function _onmessage(evt) {
      this._trigger(RcSocketEventName.MESSAGE, evt);
    }
    /**
     * @desc Simple proxy for onerror event.
     *
     * @param evt - WebSocket onerror evt.
     */

  }, {
    key: "_onerror",
    value: function _onerror(evt) {
      this._trigger(RcSocketEventName.ERROR, evt);
    }
    /**
     * @desc Helper around ws.close to ensure ws exists. If it does not exist we
     *   fail silently. This seemed logical as closing the socket would have the
     *   same effect as if the socket never existed. In other words no matter what
     *   happens in this method the net effect will always be the same.
     *
     * @param closeType - The type of close ['FORCE', 'RETRY', 'KILL']
     */

  }, {
    key: "_close",
    value: function _close(closeType) {
      this._closeType = closeType;
      this._shouldReopen = false;

      if (this._ws && this.readyState < WebSocket.CLOSING) {
        this._ws.close();

        this._stateChanged(RcSocketReadyState.CLOSING, RcSocketEventName.CLOSING);
      }
    }
    /**
     * @desc Call connect after a delayed timeout. The timeout is calculated using
     *   expotential backoff. As connect attempts increase, the time between connect
     *   attempts will grow (up to a specified connectionMaxRetryInterval).
     */

  }, {
    key: "_reconnect",
    value: function _reconnect() {
      var _this3 = this;

      var interval = (Math.pow(2, this._attempts) - 1) * 1000;
      interval = interval > this.settings.connectionMaxRetryInterval ? this.settings.connectionMaxRetryInterval : interval;
      this._attempts++;
      setTimeout(function () {
        return _this3._connect();
      }, interval);
    }
    /**
     * @desc Wrapper around ws send to make sure all data is sent in correct
     *   format.
     */

  }, {
    key: "_send",
    value: function _send(data) {
      if (this._ws) {
        this._sendPayload(JSON.stringify(data));
      }
    }
    /**
     * @desc Proxy to underlying websocket `send` method. This is pulled into its
     * own method for debugging/testing purposes.
     */

  }, {
    key: "_sendPayload",
    value: function _sendPayload(payload) {
      if (this._ws) {
        this._ws.send(payload);
      }
    }
    /* ---------------------------------------------------------------------------
     * Queue
     * ------------------------------------------------------------------------ */

    /**
     * @desc Begin processing queue.
     */

  }, {
    key: "_sendQueued",
    value: function _sendQueued() {
      var _this4 = this;

      this.queue.forEach(function (msg) {
        return _this4._send(msg);
      });
    }
    /* ---------------------------------------------------------------------------
     * Helpers
     * ------------------------------------------------------------------------ */

    /**
     * @desc Update state, log, trigger.
     *
     * @param state - String representing WebSocket.
     * @param name - String of the event name.
     * @param evt - Event object.
     */

  }, {
    key: "_stateChanged",
    value: function _stateChanged(readyState, evtName, evt) {
      this.readyState = readyState;

      this._trigger(evtName, evt);
    }
    /**
     * @desc Convenience method for semantically calling handlers.
     *
     * @param evtName - Name of event to fire.
     * @param evt - Raw WebSocket evt we are proxying.
     */

  }, {
    key: "_trigger",
    value: function _trigger(evtName, evt) {
      if (this.settings.debug) {
        this.settings.logger.debug('RcSocket', evtName, this.url, evt);
      } // TODO: Determine why handler cannot be correctly inferred


      var handler = this[evtName];
      handler && handler.call(this._ws, evt);
    }
  }]);

  return RcSocket;
}();

_defineProperty(RcSocket, "defaultSettings", {
  debug: false,
  logger: console,
  connectionTimeout: 2500,
  connectionMaxRetryInterval: 1000
});

export default RcSocket;
export { RcSocketCloseType, RcSocketEventName, RcSocketReadyState };
