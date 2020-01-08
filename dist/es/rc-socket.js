import 'core-js/modules/es.array.concat';
import 'core-js/modules/es.array.for-each';
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.array.slice';
import 'core-js/modules/es.date.to-string';
import 'core-js/modules/es.map';
import 'core-js/modules/es.object.assign';
import 'core-js/modules/es.object.to-string';
import 'core-js/modules/es.regexp.exec';
import 'core-js/modules/es.regexp.to-string';
import 'core-js/modules/es.set';
import 'core-js/modules/es.string.iterator';
import 'core-js/modules/es.string.split';
import 'core-js/modules/web.dom-collections.for-each';
import 'core-js/modules/web.dom-collections.iterator';
import { EventTarget } from 'event-target-shim';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

/* globals WebSocket:true Event: true */
/* -----------------------------------------------------------------------------
 * types
 * -------------------------------------------------------------------------- */

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

var RcSocketEventHandlerName;

(function (RcSocketEventHandlerName) {
  RcSocketEventHandlerName["CONNECTING"] = "onconnecting";
  RcSocketEventHandlerName["TIMEOUT"] = "ontimeout";
  RcSocketEventHandlerName["ERROR"] = "onerror";
  RcSocketEventHandlerName["OPEN"] = "onopen";
  RcSocketEventHandlerName["MESSAGE"] = "onmessage";
  RcSocketEventHandlerName["CLOSING"] = "onclosing";
  RcSocketEventHandlerName["CLOSE"] = "onclose";
})(RcSocketEventHandlerName || (RcSocketEventHandlerName = {}));

/* -----------------------------------------------------------------------------
 * RcSocketEvent
 *
 * Need to shim to support envornments that don't support native `Event`
 * (specifically, `react-native`)
 * -------------------------------------------------------------------------- */
var RcSocketEvent = function RcSocketEvent(type) {
  _classCallCheck(this, RcSocketEvent);

  _defineProperty(this, "type", void 0);

  this.type = type;
};
/* -----------------------------------------------------------------------------
 * RcSocket
 * -------------------------------------------------------------------------- */


var RcSocket =
/*#__PURE__*/
function (_EventTarget) {
  _inherits(RcSocket, _EventTarget);

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
    var _this;

    _classCallCheck(this, RcSocket);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RcSocket).call(this));

    _defineProperty(_assertThisInitialized(_this), "settings", {
      debug: RcSocket.defaultSettings.debug,
      logger: RcSocket.defaultSettings.logger,
      connectionTimeout: RcSocket.defaultSettings.connectionTimeout,
      connectionMaxRetryInterval: RcSocket.defaultSettings.connectionMaxRetryInterval
    });

    _defineProperty(_assertThisInitialized(_this), "url", void 0);

    _defineProperty(_assertThisInitialized(_this), "protocols", void 0);

    _defineProperty(_assertThisInitialized(_this), "onclose", null);

    _defineProperty(_assertThisInitialized(_this), "onerror", null);

    _defineProperty(_assertThisInitialized(_this), "onmessage", null);

    _defineProperty(_assertThisInitialized(_this), "onopen", null);

    _defineProperty(_assertThisInitialized(_this), "ontimeout", null);

    _defineProperty(_assertThisInitialized(_this), "onconnecting", null);

    _defineProperty(_assertThisInitialized(_this), "onclosing", null);

    _defineProperty(_assertThisInitialized(_this), "readyState", RcSocketReadyState.CONNECTING);

    _defineProperty(_assertThisInitialized(_this), "queue", []);

    _defineProperty(_assertThisInitialized(_this), "_ws", null);

    _defineProperty(_assertThisInitialized(_this), "_attempts", 1);

    _defineProperty(_assertThisInitialized(_this), "_shouldReopen", false);

    _defineProperty(_assertThisInitialized(_this), "_closeType", null);

    _defineProperty(_assertThisInitialized(_this), "_connectTimer", null);

    _defineProperty(_assertThisInitialized(_this), "_listeners", new Map());

    _this.url = url;
    _this.protocols = protocols; // Mixin instance defined settings

    Object.assign(_this.settings, settings); // Delay connect so that we can immediately add socket handlers.

    setTimeout(function () {
      return _this.open();
    }, 0);
    return _this;
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
    /**
     * @desc Registers an event handler of a specific event type on the
     * EventTarget. Unlike the default WebSocket `addEventListener` method,
     * RcSocket will return the `removeEventListener` method.
     *
     * @example
     * const listener = evt => console.log(evt)
     * socket.addEventListener('message', listener)
     *
     * @param type - A case-sensitive string representing the event type to listen
     * for.
     * @param listener - The object which receives a notification (an object that
     * implements the Event interface) when an event of the specified type occur.
     * @param options - An options object that specifies characteristics about the
     * event listener.
     */

  }, {
    key: "addEventListener",
    value: function addEventListener(type, listener, options) {
      var _this2 = this;

      var listenerKey = this._getListenerKey(type, options);

      var listenerSet = this._listeners.get(listenerKey) || new Set();

      this._listeners.set(listenerKey, listenerSet.add(listener));

      _get(_getPrototypeOf(RcSocket.prototype), "addEventListener", this).call(this, type, listener, options);

      return function () {
        return _this2.removeEventListener(type, listener, options);
      };
    }
    /**
     * @desc Removes an event listener from the EventTarget.
     *
     * @example
     * socket.removeEventListener('message', listener)
     *
     * @param type - A case-sensitive string representing the event type to listen
     * for.
     * @param listener - The object which receives a notification (an object that
     * implements the Event interface) when an event of the specified type occur.
     * @param options - An options object that specifies characteristics about the
     * event listener.
     */

  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, listener, options) {
      var listenerKey = this._getListenerKey(type, options);

      var listenerSet = this._listeners.get(listenerKey);

      if (listenerSet) {
        listenerSet.delete(listener);
        !listenerSet.size && this._listeners.delete(listenerKey);
      }

      _get(_getPrototypeOf(RcSocket.prototype), "removeEventListener", this).call(this, type, listener, options);
    }
    /**
     * @desc Removes all event listeners from the EventTarget.
     *
     * @example
     * socket.removeAllEventListeners()
     */

  }, {
    key: "removeAllEventListeners",
    value: function removeAllEventListeners() {
      var _this3 = this;

      this._listeners.forEach(function (listenerSet, key) {
        var _key$split = key.split('🚧'),
            _key$split2 = _slicedToArray(_key$split, 2),
            type = _key$split2[0],
            _capture = _key$split2[1];

        var capture = _capture === 'undefined' ? undefined : _capture === 'true';
        listenerSet.forEach(function (listener) {
          return _this3.removeEventListener(type, listener, capture);
        });
      });

      this._listeners.clear();
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
      var _this4 = this;

      this._ws = Object.assign(new WebSocket(this.url, this.protocols), {
        id: Date.now()
      });
      this._ws.onopen = this._onopen.bind(this);
      this._ws.onclose = this._onclose.bind(this);
      this._ws.onmessage = this._onmessage.bind(this);
      this._ws.onerror = this._onerror.bind(this); // Rather than letting the websocket set indefinetely, we close the socket
      // after a specified timeout. The close will automatically handle retrying.

      this._connectTimer = setTimeout(function () {
        _this4._trigger(RcSocketEventHandlerName.TIMEOUT);

        _this4._close(RcSocketCloseType.RETRY);
      }, this.settings.connectionTimeout);

      this._stateChanged(RcSocketReadyState.CONNECTING, RcSocketEventHandlerName.CONNECTING);
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

      this._stateChanged(RcSocketReadyState.OPEN, RcSocketEventHandlerName.OPEN, evt);

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
        this._stateChanged(RcSocketReadyState.CLOSED, RcSocketEventHandlerName.CLOSE, Object.assign(evt, {
          forced: true
        }));

        if (this._shouldReopen) {
          this.open();
        }
      } else {
        if (this._closeType !== RcSocketCloseType.RETRY) {
          this._trigger(RcSocketEventHandlerName.CLOSE, evt);
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
      this._trigger(RcSocketEventHandlerName.MESSAGE, evt);
    }
    /**
     * @desc Simple proxy for onerror event.
     *
     * @param evt - WebSocket onerror evt.
     */

  }, {
    key: "_onerror",
    value: function _onerror(evt) {
      this._trigger(RcSocketEventHandlerName.ERROR, evt);
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

        this._stateChanged(RcSocketReadyState.CLOSING, RcSocketEventHandlerName.CLOSING);
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
      var _this5 = this;

      var interval = (Math.pow(2, this._attempts) - 1) * 1000;
      interval = interval > this.settings.connectionMaxRetryInterval ? this.settings.connectionMaxRetryInterval : interval;
      this._attempts++;
      setTimeout(function () {
        return _this5._connect();
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
      var _this6 = this;

      this.queue.forEach(function (msg) {
        return _this6._send(msg);
      });
    }
    /* ---------------------------------------------------------------------------
     * Helpers
     * ------------------------------------------------------------------------ */

    /**
     * @desc Small helper to obtain consistent key for lookingup our listeners
     * based on event listener matching algorithm
     * ref: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#Matching_event_listeners_for_removal
     *
     * @param type - A case-sensitive string representing the event type to listen
     * for.
     * @param options - An options object that specifies characteristics about the
     * event listener.
     */

  }, {
    key: "_getListenerKey",
    value: function _getListenerKey(type, options) {
      var capture = _typeof(options) === 'object' ? options.capture : options; // Using an obscure emoji as a separator to reduce any collisions that
      // could occur with custom event types. Example: `message:1234`

      return typeof capture === 'boolean' ? "".concat(type, "\uD83D\uDEA7").concat(capture.toString()) : "".concat(type, "\uD83D\uDEA7undefined");
    }
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
    value: function _trigger(evtHandlerName, evt) {
      var event = typeof evt === 'undefined' ? new RcSocketEvent(evtHandlerName.slice(2)) : new evt.constructor(evt.type, evt);

      if (this.settings.debug) {
        this.settings.logger.debug('RcSocket', evtHandlerName, this.url, event);
      } // TODO: Determine why handler cannot be correctly inferred


      var handler = this[evtHandlerName];
      handler && handler.call(this._ws, event);
      this.dispatchEvent(event);
    }
  }]);

  return RcSocket;
}(EventTarget);

_defineProperty(RcSocket, "defaultSettings", {
  debug: false,
  logger: console,
  connectionTimeout: 2500,
  connectionMaxRetryInterval: 1000
});

export default RcSocket;
export { RcSocketCloseType, RcSocketEventHandlerName, RcSocketReadyState };
