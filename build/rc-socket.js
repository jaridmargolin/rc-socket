(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["RcSocket"] = factory();
	else
		root["RcSocket"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 43);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.4' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(2)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_json_stringify__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_json_stringify___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_json_stringify__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_object_assign__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_object_assign___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_object_assign__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_task_queue_js__ = __webpack_require__(13);
/* globals WebSocket:true */
/* adapted from: https://github.com/joewalnes/reconnecting-websocket */


/* -----------------------------------------------------------------------------
* dependencies
* -------------------------------------------------------------------------- */

// lib





/* -----------------------------------------------------------------------------
 * RcSocket
 * -------------------------------------------------------------------------- */

class RcSocket {

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
   * @param {String} url - Url to connect to.
   * @param {String|Array} protocols - Optional subprotocols.
   */
  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;

    this.debug = this.constructor.debug;
    this.logger = this.constructor.logger;
    this.connectionTimeout = this.constructor.connectionTimeout;
    this.connectionMaxRetryInterval = this.constructor.connectionMaxRetryInterval;
    this.queueSendDelay = this.constructor.queueSendDelay;

    // TODO: bind individual methods using decorators
    const boundMethods = ['_connect', '_onopen', '_onclose', '_onmessage', '_onerror', '_processQueueTask'];
    boundMethods.forEach(method => this[method] = this[method].bind(this));

    // Queue used to store messages sent before socket ready.
    // By default, the queue updates on task complete, howeverm as far as we
    // are concerned with messages, once they are sent, they are gone.
    this.queue = new __WEBPACK_IMPORTED_MODULE_2_task_queue_js__["a" /* default */](this._processQueueTask);
    this.queue.shiftOnProcess = true;

    // Delay connect so that we can immediately add socket handlers.
    setTimeout(() => this.open(), 0);
  }

  /**
   * @desc Sets initial websocket state and connects. Useful for situations
   * where you want to close the socket and reopen it at a later time.
   *
   * @example
   * socket.close()
   * socket.open()
   */
  open() {
    if (!this.readyState || this.readyState > WebSocket['CLOSING']) {
      this._reset();
      this._connect();
    } else if (this.readyState === WebSocket['CLOSING']) {
      this.shouldReopen = true;
    }
  }

  /**
   * @desc Wrapper around ws.send that adds queue functionality when socket is
   *   not in a connected readyState.
   *
   * @example
   * socket.send({ prop: 'val' })
   *
   * @param {Object} data - data to send via web socket.
   */
  send(data) {
    // If the queue is actively being process we will move this send to be
    // processed within the queue cycle.
    return this.readyState === WebSocket['OPEN'] && this.queue.isEmpty() ? this._send(data) : this.queue.add(data);
  }

  /**
   * @desc Explicitly close socket. Overrides default RcSocket reconnection logic.
   *
   * @example
   * socket.close()
   */
  close() {
    this._close('FORCE');
  }

  /**
   * @desc Hard kill by cleaning up all handlers.
   *
   * @example
   * socket.kill()
   */
  kill() {
    this._close('KILL');
    this._reset();
  }

  /**
   * @desc Refresh the connection if open (close, re-open). If the app suspects
   *   the socket is stale (occurs when changing from wifi -> carrier or vice
   *   versa), this method will close the existing socket and reconnect.
   *
   * @example
   * socket.reboot()
   */
  reboot() {
    this.kill();
    this._connect();
  }

  /* ---------------------------------------------------------------------------
   * WebSocket Management
   * ------------------------------------------------------------------------ */

  /**
   * @private
   * @desc Wrapper around WebSocket creation. By wrapping the raw WebSocket we
   *   have the opportunity to manipulate events, change behavior (like adding
   *   reconnection logic), and then finally proxy the events as if we were a
   *   the actual socket.
   */
  _connect() {
    this.ws = new WebSocket(this.url, this.protocols);
    this.ws.onopen = this._onopen;
    this.ws.onclose = this._onclose;
    this.ws.onmessage = this._onmessage;
    this.ws.onerror = this._onerror;

    // Attach an id to the internal web socket. Could be use for various reasons
    // but initially being introduced for debugging purposes.
    this.ws.id = Date.now();

    // Rather than letting the websocket set indefinetely, we close the socket
    // after a specified timeout. The close will automatically handle retrying.
    this.connectTimer = setTimeout(__ => {
      this._trigger('ontimeout');
      this._close('RETRY');
    }, this.connectionTimeout);

    this._stateChanged('CONNECTING', 'onconnecting');
  }

  /**
   * @private
   * @desc Stop all async code from executing. Used internally anytime a socket
   * is either manually closed, or interpretted as closed
   */
  _stop() {
    this.queueTimer = clearTimeout(this.queueTimer);
    this.connectTimer = clearTimeout(this.connectTimer);
  }

  /**
   * @private
   * @desc Reset socket to initial state.
   *
   * @example
   * socket._reset()
   */
  _reset() {
    this._stop();

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
    }

    delete this.ws;
    delete this.readyState;
    delete this.closeType;
    delete this.shouldReopen;

    this.attempts = 1;
  }

  /**
   * @private
   * @desc Timeout cleanup, state management, and queue handling.
   *
   * @param {Object} evt - WebSocket onopen evt.
   */
  _onopen(evt) {
    clearTimeout(this.connectTimer);

    // Fix error where close is explicitly called but onopen event is still
    // triggered.
    if (this.closeType === 'FORCE') {
      return this.close();
    }

    this.attempts = 1;
    this._stateChanged('OPEN', 'onopen', evt);
    this._sendQueued();
  }

  /**
   * @private
   * @desc Responsible for interpretting the various possible close types (force,
   *   retry, etc...) and reconnecting/proxying events accordinly.
   *
   * @param {Object} evt - WebSocket onclose evt.
   */
  _onclose(evt) {
    this._stop();
    delete this.ws;

    // Immediately change state and exit on force close.
    if (this.closeType === 'FORCE') {
      this._stateChanged('CLOSED', 'onclose', __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_object_assign___default()(evt, {
        forced: true
      }));

      if (this.shouldReopen) {
        this.open();
      }
    } else {
      if (this.closeType !== 'RETRY') {
        this._trigger('onclose', evt);
      }

      this._reconnect();
    }
  }

  /**
   * @private
   * @desc Simple proxy for onmessage event.
   *
   * @param {Object} evt - WebSocket onmessage evt.
   */
  _onmessage(evt) {
    this._trigger('onmessage', evt);
  }

  /**
   * @private
   * @desc Simple proxy for onerror event.
   *
   * @param {Object} evt - WebSocket onerror evt.
   */
  _onerror(evt) {
    this._trigger('onerror', evt);
  }

  /**
   * @private
   * @desc Helper around ws.close to ensure ws exists. If it does not exist we
   *   fail silently. This seemed logical as closing the socket would have the
   *   same effect as if the socket never existed. In other words no matter what
   *   happens in this method the net effect will always be the same.
   *
   * @param {String} closeType - The type of close ['FORCE', 'RETRY', 'KILL']
   */
  _close(closeType) {
    this.closeType = closeType;
    this.shouldReopen = false;

    if (this.ws && this.readyState < WebSocket['CLOSING']) {
      this.ws.close();
      this._stateChanged('CLOSING', 'onclosing');
    }
  }

  /**
   * @private
   * @desc Call connect after a delayed timeout. The timeout is calculated using
   *   expotential backoff. As connect attempts increase, the time between connect
   *   attempts will grow (up to a specified connectionMaxRetryInterval).
   */
  _reconnect() {
    let interval = (Math.pow(2, this.attempts) - 1) * 1000;
    interval = interval > this.connectionMaxRetryInterval ? this.connectionMaxRetryInterval : interval;

    this.attempts++;
    setTimeout(this._connect, interval);
  }

  /**
   * @private
   * @desc Wrapper around ws send to make sure all data is sent in correct
   *   format.
   */
  _send(data) {
    if (this.ws) {
      this._sendPayload(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_json_stringify___default()(data));
    }
  }

  /**
   * @private
   * @desc Proxy to underlying websocket `send` method.
   */
  _sendPayload(payload) {
    this.ws.send(payload);
    return this;
  }

  /* ---------------------------------------------------------------------------
   * Queue
   * ------------------------------------------------------------------------ */

  /**
   * @private
   * @desc Begin processing queue.
   */
  _sendQueued() {
    if (!this.queue.isEmpty()) {
      this.queue.process();
    }
  }

  /**
   * @private
   * @desc Send message from tail of queue.
   */
  _processQueueTask(msg, next) {
    this._send(msg);

    if (!this.queue.isEmpty()) {
      this.queueTimer = setTimeout(next, this.queueSendDelay);
    }
  }

  /* ---------------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------------ */

  /**
   * @private
   * @desc Update state, log, trigger.
   *
   * @param {String} state - String representing WebSocket.
   * @param {String} name - String of the event name.
   * @param {Object} evt - Event object.
   */
  _stateChanged(state, evtName, evt) {
    this.readyState = WebSocket[state];
    this._trigger(evtName, evt);
  }

  /**
   * @private
   * @desc Convenience method for semantically calling handlers.
   *
   * @param {String} evtName - Name of event to fire.
   * @param {Object} evt - Raw WebSocket evt we are proxying.
   */
  _trigger(evtName, evt) {
    if (this.debug || RcSocket.debugAll) {
      this.logger.debug('RcSocket', evtName, this.url, evt);
    }

    if (this[evtName]) {
      this[evtName](evt);
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = RcSocket;


RcSocket.debug = false;
RcSocket.logger = console;
RcSocket.connectionTimeout = 2500;
RcSocket.connectionMaxRetryInterval = 1000;
RcSocket.queueSendDelay = 100;
/* harmony default export */ __webpack_exports__["a"] = (RcSocket);

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


/* -----------------------------------------------------------------------------
 * TaskQueue
 * -------------------------------------------------------------------------- */

class TaskQueue {
  /**
   * @desc Extensible async task queue.
   *
   * @example
   * const queue = new TaskQueue((task, next) => {
   *   task.fn(task.opts, next)
   * })
   *
   * @param {Function} processFn - Function called when task is processed.
   */
  constructor(processFn) {
    this.processFn = processFn;
    this.tasks = [];
    this.indexes = {};

    // respect any values set in subclasses
    this.indexName = this.indexName || 'id';
  }

  /**
   * @desc Add item(s) to queue. Optionally being processing queue.
   *
   * @example
   * queue.add({ 'id': 1, args: arguments }, true)
   *
   * @param {Array|Object} tasks - An array or single task to add to queue.
   */
  add(tasks, processTask) {
    const isEmpty = this.isEmpty();
    const result = Array.isArray(tasks) ? this._addTasks(tasks) : this._addTask(tasks);

    if (isEmpty && processTask) {
      this.process();
    }

    return result;
  }

  /**
   * @desc Check to determine if queue is empty. Queue is considered empty
   *   if the tasks array has a length of 0.
   *
   * @example
   * queue.isEmpty()
   */
  isEmpty() {
    return !this.tasks.length;
  }

  /**
   * @desc Proccess task found at the head of the queue.
   *
   * @example
   * queue.process()
   */
  process() {
    const task = this.shiftOnProcess ? this._shift() : this.tasks[0];

    this.processFn(task, () => {
      if (!this.shiftOnProcess) {
        this._shift();
      }

      return this.isEmpty() ? null : this.process();
    });
  }

  /**
   * @desc Clear all currently queued tasks.
   *
   * @example
   * queue.clear()
   */
  clear() {
    for (var i = 0, l = this.tasks.length; i < l; i++) {
      delete this.indexes[this.tasks[i][this.indexName]];
    }

    this.tasks.length = 0;
  }

  /* ---------------------------------------------------------------------------
   * internal/helpers
   * ------------------------------------------------------------------------ */

  /**
   * @private
   * @desc Add item(s) to queue.
   *
   * @param {Array} tasks - Loop over passed tasks abd add each to queue.
   */
  _addTasks(tasks) {
    const added = [];
    for (var i = 0, l = tasks.length; i < l; i++) {
      added.push(this._addTask(tasks[i]));
    }

    return added;
  }

  /**
   * @private
   * @desc Add item to queue. Small wrapper around push that first checks
   *   if task is a duplicate.
   *
   * @param {Object} task - A single task item. Can contain any desired properties.
   */
  _addTask(task) {
    if (!this._isDuplicate(task)) {
      this._push(task);
    }

    return task;
  }

  /**
   * @private
   * @desc Check if task is a duplicate. By default it checks against a map of
   *   index. Override if duplicate check requires additional logic.
   *
   * @param {Object} task - A single task item.
   */
  _isDuplicate(task) {
    return this.indexes.hasOwnProperty(task[this.indexName]);
  }

  /**
   * @private
   * @desc Push task object to tail of tasks list and add to indexes map.
   *
   * @param {Object} task - A single task item.
   */
  _push(task) {
    const indexVal = this.tasks.push(task) - 1;

    if (task.hasOwnProperty(this.indexName)) {
      this.indexes[task[this.indexName]] = indexVal;
    }
  }

  /**
   * @private
   * @desc Remove and return the task at the head of the tasks list. Also removes
   *   task from indexes map.
   */
  _shift() {
    const task = this.tasks.shift();
    delete this.indexes[task[this.indexName]];

    return task;
  }
}
/* unused harmony export TaskQueue */


/* harmony default export */ __webpack_exports__["a"] = (TaskQueue);

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 8 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(21);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(9);
var defined = __webpack_require__(7);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__rc_socket__ = __webpack_require__(5);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return __WEBPACK_IMPORTED_MODULE_0__rc_socket__["a"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "RcSocket", function() { return __WEBPACK_IMPORTED_MODULE_0__rc_socket__["b"]; });



/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__task_queue__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__task_queue__["a"]; });
/* unused harmony namespace reexport */



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(16), __esModule: true };

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(17), __esModule: true };

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(42);
module.exports = __webpack_require__(0).Object.assign;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(4);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(11);
var toLength = __webpack_require__(38);
var toAbsoluteIndex = __webpack_require__(37);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 21 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(18);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(4);
var document = __webpack_require__(3).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 24 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(3);
var core = __webpack_require__(0);
var ctx = __webpack_require__(22);
var hide = __webpack_require__(26);
var has = __webpack_require__(8);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(29);
var createDesc = __webpack_require__(34);
module.exports = __webpack_require__(1) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(1) && !__webpack_require__(2)(function () {
  return Object.defineProperty(__webpack_require__(23)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(32);
var gOPS = __webpack_require__(30);
var pIE = __webpack_require__(33);
var toObject = __webpack_require__(39);
var IObject = __webpack_require__(9);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(2)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(19);
var IE8_DOM_DEFINE = __webpack_require__(27);
var toPrimitive = __webpack_require__(40);
var dP = Object.defineProperty;

exports.f = __webpack_require__(1) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(8);
var toIObject = __webpack_require__(11);
var arrayIndexOf = __webpack_require__(20)(false);
var IE_PROTO = __webpack_require__(35)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(31);
var enumBugKeys = __webpack_require__(24);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 33 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(36)('keys');
var uid = __webpack_require__(41);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(3);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
  return store[key] || (store[key] = {});
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(10);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(10);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(7);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(4);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 41 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(25);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(28) });


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(12);


/***/ })
/******/ ]);
});