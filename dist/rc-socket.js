(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['RcSocket'] = factory();
  }
}(this, function () {

/*!
 * isArray.js
 * 
 * Copyright (c) 2014
 */
var utlIsArray, taskQueueTaskQueue, rcSocket;
utlIsArray = function (value) {
  return Object.prototype.toString.call(value) === '[object Array]';
};
/*!
 * task-queue.js
 */
taskQueueTaskQueue = function (require) {
  /* -----------------------------------------------------------------------------
   * dependencies
   * ---------------------------------------------------------------------------*/
  var isArray = utlIsArray;
  /* -----------------------------------------------------------------------------
   * TaskQueue
   * ---------------------------------------------------------------------------*/
  /**
   * @global
   * @public
   * @constructor
   *
   * @name TaskQueue
   * @desc Extensible async task queue.
   *
   * @example
   * var queue = new TaskQueue(function (task, next) {
   *   task.fn(task.opts, next);
   * });
   *
   * @param {Function} processFn - Function called when task is processed.
   */
  var TaskQueue = function (processFn) {
    this.processFn = processFn;
    this.tasks = [];
    this.indexes = {};
    // respect any values set in subclasses
    this.indexName = this.indexName || 'id';
  };
  /**
   * @public
   * @memberof TaskQueue
   *
   * @desc Add item(s) to queue. Optionally being processing queue.
   *
   * @example
   * queue.add({ 'id': 1, args: arguments }, true);
   *
   * @param {Array|Object} tasks - An array or single task to add to queue.
   */
  TaskQueue.prototype.add = function (tasks, processTask) {
    var isEmpty = this.isEmpty();
    var result = isArray(tasks) ? this._addTasks(tasks) : this._addTask(tasks);
    if (isEmpty && processTask) {
      this.process();
    }
    return result;
  };
  /**
   * @public
   * @memberof TaskQueue
   *
   * @desc Check to determine if queue is empty. Queue is considered empty
   *   if the tasks array has a length of 0.
   *
   * @example
   * queue.isEmpty();
   */
  TaskQueue.prototype.isEmpty = function () {
    return !this.tasks.length;
  };
  /**
   * @public
   * @memberof TaskQueue
   *
   * @desc Proccess task found at the head of the queue.
   *
   * @example
   * queue.process();
   */
  TaskQueue.prototype.process = function () {
    var self = this;
    var task = this.shiftOnProcess ? this._shift() : this.tasks[0];
    this.processFn(task, function () {
      if (!self.shiftOnProcess) {
        self._shift();
      }
      return self.isEmpty() ? null : self.process.call(self);
    });
  };
  /**
   * @public
   * @memberof TaskQueue
   *
   * @desc Clear all currently queued tasks.
   *
   * @example
   * queue.clear();
   */
  TaskQueue.prototype.clear = function () {
    for (var i = 0, l = this.tasks.length; i < l; i++) {
      delete this.indexes[this.tasks[i][this.indexName]];
    }
    this.tasks.length = 0;
  };
  /* -----------------------------------------------------------------------------
   * internal/helpers
   * ---------------------------------------------------------------------------*/
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Add item(s) to queue.
   *
   * @param {Array} tasks - Loop over passed tasks abd add each to queue.
   */
  TaskQueue.prototype._addTasks = function (tasks) {
    var added = [];
    for (var i = 0, l = tasks.length; i < l; i++) {
      added.push(this._addTask(tasks[i]));
    }
    return added;
  };
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Add item to queue. Small wrapper around push that first checks
   *   if task is a duplicate.
   *
   * @param {Object} task - A single task item. Can contain any desired properties.
   */
  TaskQueue.prototype._addTask = function (task) {
    if (!this._isDuplicate(task)) {
      this._push(task);
    }
    return task;
  };
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Check if task is a duplicate. By default it checks against a map of
   *   index. Override if duplicate check requires additional logic.
   *
   * @param {Object} task - A single task item.
   */
  TaskQueue.prototype._isDuplicate = function (task) {
    return this.indexes.hasOwnProperty(task[this.indexName]);
  };
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Push task object to tail of tasks list and add to indexes map.
   *
   * @param {Object} task - A single task item.
   */
  TaskQueue.prototype._push = function (task) {
    var indexVal = this.tasks.push(task) - 1;
    if (task.hasOwnProperty(this.indexName)) {
      this.indexes[task[this.indexName]] = indexVal;
    }
  };
  /**
   * @private
   * @memberof TaskQueue
   *
   * @desc Remove and return the task at the head of the tasks list. Also removes
   *   task from indexes map.
   */
  TaskQueue.prototype._shift = function () {
    var task = this.tasks.shift();
    delete this.indexes[task.indexName];
    return task;
  };
  /* -----------------------------------------------------------------------------
   * expose
   * ---------------------------------------------------------------------------*/
  return TaskQueue;
}({});
/*!
 * rc-socket.js:
 * Originally adapted from: https://github.com/joewalnes/reconnecting-websocket
 */
rcSocket = function (require) {
  /* -----------------------------------------------------------------------------
   * dependencies
   * ---------------------------------------------------------------------------*/
  var TaskQueue = taskQueueTaskQueue;
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
   * @global
   * @public
   * @constructor
   *
   * @name RcSocket
   * @desc This behaves like a WebSocket in every way, except if it fails to
   * connect, or it gets disconnected, it will use an exponential backoff until
   * it succesfully connects again.
   *
   * It is API compatible with the standard WebSocket API.
   *
   * @example
   * var ws = new ReconnectingWebsocket(wss://host);
   *
   * @param {String} url - Url to connect to.
   * @param {String|Array} protocols - Optional subprotocols.
   */
  var RcSocket = function (url, protocols) {
    this.url = url;
    this.protocols = protocols;
    this.debug = false;
    this.timeout = 2500;
    this.maxRetry = 1000;
    this.delay = 100;
    this.logger = console;
    this.hasUnloaded = false;
    this.hasOpened = false;
    this.wasForced = false;
    this.isRetrying = false;
    this.attempts = 1;
    // Queue used to store messages sent before socket ready.
    // By default, the queue updates on task complete, howeverm as far as we
    // are concerned with messages, once they are sent, they are gone.
    this.queue = new TaskQueue(this._processQueueTask.bind(this));
    this.queue.shiftOnProcess = true;
    // Hack P1: Safegaurd against firefox behavior where close event is
    // triggered on page navigation and results in an attempted reconnect.
    window.onbeforeunload = function () {
      this.hasUnloaded = true;
    }.bind(this);
    // Delay connect so that we can immediately add socket handlers.
    setTimeout(this._connect.bind(this), 0);
  };
  /**
   * @public
   * @memberof RcSocket
   *
   * @desc Wrapper around ws.send that adds queue functionality when socket is
   *   not in a connected readyState.
   *
   * @example
   * socket.send({ prop: 'val' });
   *
   * @param {Object} data - data to send via web socket.
   */
  RcSocket.prototype.send = function (data) {
    // TODO: Seems like we should be checking if readyState is connected?
    // If the queue is actively being process we will move this send to be
    // processed within the queue cycle.
    return this.ws && this.readyState && this.queue.isEmpty() ? this._send(data) : this.queue.add(data);
  };
  /**
   * @public
   * @memberof RcSocket
   *
   * @desc Explicitly close socket. Overrides default RcSocket reconnection logic.
   *
   * @example
   * socket.close();
   */
  RcSocket.prototype.close = function () {
    this.wasForced = true;
    this._close();
  };
  /**
   * @public
   * @memberof RcSocket
   *
   * @desc Hard kill by cleaning up all handlers.
   *
   * @example
   * socket.kill();
   */
  RcSocket.prototype.killSocket = function () {
    this.ws.onopen = null;
    this.ws.onclose = null;
    this.ws.onmessage = null;
    this.ws.onerror = null;
    this.close();
    delete this.ws;
  };
  /**
   * @public
   * @memberof RcSocket
   *
   * @desc Reset socket to initial state.
   *
   * @example
   * socket.reset();
   *
   * @param {Array} queue - Optionally reset with a given queue.
   */
  RcSocket.prototype.reset = function () {
    // reset internal state
    clearTimeout(this.queueTimer);
    clearTimeout(this.connectTimer);
    this.queueTimer = null;
    this.connectTimer = null;
    this.hasUnloaded = false;
    this.hasOpened = false;
    this.wasForced = false;
    this.isRetrying = false;
    this.attempts = 1;
  };
  /**
   * @public
   * @memberof RcSocket
   *
   * @desc Retry is intended to be called when the socket has yet to connect.
   *   Rather than letting it set indefinetely, we close the socket after a
   *   specified timeout and attempt to reconnect.
   */
  RcSocket.prototype.retry = function () {
    this.isRetrying = true;
    this._close();
  };
  /**
   * @public
   * @memberof RcSocket
   *
   * @desc Refresh the connection if open (close, re-open). If the app suspects
   *   the socket is stale (occurs when changing from wifi -> carrier or vice
   *   versa), this method will close the existing socket and reconnect.
   *
   * @public
   */
  RcSocket.prototype.reboot = function () {
    this.killSocket();
    this.reset();
    this._connect();
  };
  /* -----------------------------------------------------------------------------
   * WebSocket Management
   * ---------------------------------------------------------------------------*/
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Wrapper around WebSocket creation. By wrapping the raw WebSocket we
   *   have the opportunity to manipulate events, change behavior (like adding
   *   reconnection logic), and then finally proxy the events as if we were a
   *   the actual socket.
   */
  RcSocket.prototype._connect = function () {
    this.ws = new WebSocket(this.url, this.protocols);
    this.ws.onopen = this._onopen.bind(this);
    this.ws.onclose = this._onclose.bind(this);
    this.ws.onmessage = this._onmessage.bind(this);
    this.ws.onerror = this._onerror.bind(this);
    // Attach an id to the internal web socket. Could be use for various reasons
    // but initially being introduced for debugging purposes.
    this.ws.id = Date.now();
    this.connectTimer = setTimeout(function () {
      this._trigger('ontimeout');
      this.retry();
    }.bind(this), this.timeout);
    this._stateChanged('CONNECTING', 'onconnecting');
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Timeout cleanup, state management, and queue handling.
   *
   * @param {Object} evt - WebSocket onopen evt.
   */
  RcSocket.prototype._onopen = function (evt) {
    clearTimeout(this.connectTimer);
    // Fix error where close is explicitly called but onopen event is still
    // triggered.
    if (this.wasForced) {
      return this.close();
    }
    this.hasOpened = true;
    this.attempts = 1;
    this._stateChanged('OPEN', 'onopen', evt);
    this._sendQueued();
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Responsible for interpretting the various possible close types (force,
   *   retry, etc...) and reconnecting/proxying events accordinly.
   *
   * @param {Object} evt - WebSocket onclose evt.
   */
  RcSocket.prototype._onclose = function (evt) {
    clearTimeout(this.queueTimer);
    clearTimeout(this.connectTimer);
    this.ws = null;
    // Because RcSocket holds state we can pass additional information to
    // upstream handlers regarding why the socket was closed.
    evt.forced = this.wasForced;
    evt.isRetrying = this.isRetrying;
    // Immediately change state and exit on force close.
    if (this.wasForced) {
      this._stateChanged('CLOSED', 'onclose', evt);
    } else if (!this.hasUnloaded) {
      // Was open at some point so we need to trigger close evts
      // TODO: Wondering it state change should ALWAYS BE CALLED?
      if (this.hasOpened) {
        this._trigger('onclose', evt);
      }
      this.isRetrying = false;
      this.hasOpened = false;
      this._reconnect();
    }
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Simple proxy for onmessage event.
   *
   * @param {Object} evt - WebSocket onmessage evt.
   */
  RcSocket.prototype._onmessage = function (evt) {
    this._trigger('onmessage', evt);
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Simple proxy for onerror event.
   *
   * @param {Object} evt - WebSocket onerror evt.
   */
  RcSocket.prototype._onerror = function (evt) {
    this._trigger('onerror', evt);
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Helper around ws.close to ensure ws exists. If it does not exist we
   *   fail silently. This seemed logical as closing the socket would have the
   *   same effect as if the socket never existed. In other words no matter what
   *   happens in this method the net effect will always be the same.
   */
  RcSocket.prototype._close = function () {
    if (this.ws) {
      this.ws.close();
    }
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Call connect after a delayed timeout. The timeout is calculated using
   *   expotential backoff. As connect attempts increase, the time between connect
   *   attempts will grow (up to a specified maxRetry).
   */
  RcSocket.prototype._reconnect = function () {
    var interval = (Math.pow(2, this.attempts) - 1) * 1000;
    interval = interval > this.maxRetry ? this.maxRetry : interval;
    this.attempts++;
    setTimeout(this._connect.bind(this), interval);
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Wrapper around ws send to make sure all data is sent in correct format.
   */
  RcSocket.prototype._send = function (data) {
    if (this.ws) {
      this.ws.send(JSON.stringify(data));
    }
  };
  /* -----------------------------------------------------------------------------
   * Queue
   * ---------------------------------------------------------------------------*/
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Begin processing queue.
   */
  RcSocket.prototype._sendQueued = function () {
    if (!this.queue.isEmpty()) {
      this.queue.process();
    }
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Send message from tail of queue.
   */
  RcSocket.prototype._processQueueTask = function (msg, next) {
    this._send(msg);
    if (!this.queue.isEmpty()) {
      this.queueTimer = setTimeout(next, this.delay);
    }
  };
  /* -----------------------------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------------------------*/
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Update state, log, trigger.
   *
   * @param {String} state - String representing WebSocket.
   * @param {String} name - String of the event name.
   * @param {Object} evt - Event object.
   */
  RcSocket.prototype._stateChanged = function (state, evtName, evt) {
    this.readyState = WebSocket[state];
    this._trigger(evtName, evt);
  };
  /**
   * @private
   * @memberof RcSocket
   *
   * @desc Convenience method for semantically calling handlers.
   *
   * @param {String} evtName - Name of event to fire.
   * @param {Object} evt - Raw WebSocket evt we are proxying.
   */
  RcSocket.prototype._trigger = function (evtName, evt) {
    if (this.debug || RcSocket.debugAll) {
      this.logger.debug('RcSocket', evtName, this.url, evt);
    }
    if (this[evtName]) {
      this[evtName](evt);
    }
  };
  /* -----------------------------------------------------------------------------
   * export
   * ---------------------------------------------------------------------------*/
  return RcSocket;
}({});

return rcSocket;


}));