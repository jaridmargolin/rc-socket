/* globals WebSocket:true */
/* adapted from: https://github.com/joewalnes/reconnecting-websocket */
'use strict'

/* -----------------------------------------------------------------------------
* dependencies
* -------------------------------------------------------------------------- */

// lib
import TaskQueue from 'task-queue.js'

/* -----------------------------------------------------------------------------
 * RcSocket
 * -------------------------------------------------------------------------- */

export class RcSocket {
  static debug = false
  static logger = console
  static connectionTimeout = 2500
  static connectionMaxRetryInterval = 1000
  static queueSendDelay = 100

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
  constructor (url, protocols) {
    this.url = url
    this.protocols = protocols

    this.hasUnloaded = false
    this.hasOpened = false
    this.wasForced = false
    this.isRetrying = false
    this.attempts = 1

    this.debug = this.constructor.debug
    this.logger = this.constructor.logger
    this.connectionTimeout = this.constructor.connectionTimeout
    this.connectionMaxRetryInterval = this.constructor.connectionMaxRetryInterval
    this.queueSendDelay = this.constructor.queueSendDelay

    // TODO: bind individual methods using decorators
    const boundMethods = ['_connect', '_onopen', '_onclose', '_onmessage',
      '_onerror', '_processQueueTask']
    boundMethods.forEach(method => (this[method] = this[method].bind(this)))

    // Queue used to store messages sent before socket ready.
    // By default, the queue updates on task complete, howeverm as far as we
    // are concerned with messages, once they are sent, they are gone.
    this.queue = new TaskQueue(this._processQueueTask)
    this.queue.shiftOnProcess = true

    // Hack P1: Safegaurd against firefox behavior where close event is
    // triggered on page navigation and results in an attempted reconnect.
    window.onbeforeunload = __ => { this.hasUnloaded = true }

    // Delay connect so that we can immediately add socket handlers.
    setTimeout(this._connect, 0)
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
  send (data) {
    // TODO: Seems like we should be checking if readyState is connected?
    // If the queue is actively being process we will move this send to be
    // processed within the queue cycle.
    return this.ws && this.readyState && this.queue.isEmpty()
      ? this._send(data)
      : this.queue.add(data)
  }

  /**
   * @desc Explicitly close socket. Overrides default RcSocket reconnection logic.
   *
   * @example
   * socket.close()
   */
  close () {
    this.wasForced = true
    this._close()
  }

  /**
   * @desc Hard kill by cleaning up all handlers.
   *
   * @example
   * socket.killSocket()
   */
  killSocket () {
    this.ws.onopen = null
    this.ws.onclose = null
    this.ws.onmessage = null
    this.ws.onerror = null

    this.close()
    delete this.ws
  }

  /**
   * @desc Reset socket to initial state.
   *
   * @example
   * socket.reset()
   *
   * @param {Array} queue - Optionally reset with a given queue.
   */
  reset () {
    // reset internal state
    clearTimeout(this.queueTimer)
    clearTimeout(this.connectTimer)

    this.queueTimer = null
    this.connectTimer = null
    this.hasUnloaded = false
    this.hasOpened = false
    this.wasForced = false
    this.isRetrying = false
    this.attempts = 1
  }

  /**
   * @desc Retry is intended to be called when the socket has yet to connect.
   *   Rather than letting it set indefinetely, we close the socket after a
   *   specified timeout and attempt to reconnect.
   *
   * @example
   * socket.retry()
   */
  retry () {
    this.isRetrying = true
    this._close()
  }

  /**
   * @desc Refresh the connection if open (close, re-open). If the app suspects
   *   the socket is stale (occurs when changing from wifi -> carrier or vice
   *   versa), this method will close the existing socket and reconnect.
   *
   * @example
   * socket.reboot()
   */
  reboot () {
    this.killSocket()
    this.reset()
    this._connect()
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
  _connect () {
    this.ws = new WebSocket(this.url, this.protocols)
    this.ws.onopen = this._onopen
    this.ws.onclose = this._onclose
    this.ws.onmessage = this._onmessage
    this.ws.onerror = this._onerror

    // Attach an id to the internal web socket. Could be use for various reasons
    // but initially being introduced for debugging purposes.
    this.ws.id = Date.now()

    this.connectTimer = setTimeout(__ => {
      this._trigger('ontimeout')
      this.retry()
    }, this.connectionTimeout)

    this._stateChanged('CONNECTING', 'onconnecting')
  }

  /**
   * @private
   * @desc Timeout cleanup, state management, and queue handling.
   *
   * @param {Object} evt - WebSocket onopen evt.
   */
  _onopen (evt) {
    clearTimeout(this.connectTimer)

    // Fix error where close is explicitly called but onopen event is still
    // triggered.
    if (this.wasForced) {
      return this.close()
    }

    this.hasOpened = true
    this.attempts = 1
    this._stateChanged('OPEN', 'onopen', evt)
    this._sendQueued()
  }

  /**
   * @private
   * @desc Responsible for interpretting the various possible close types (force,
   *   retry, etc...) and reconnecting/proxying events accordinly.
   *
   * @param {Object} evt - WebSocket onclose evt.
   */
  _onclose (evt) {
    clearTimeout(this.queueTimer)
    clearTimeout(this.connectTimer)
    this.ws = null

    // Because RcSocket holds state we can pass additional information to
    // upstream handlers regarding why the socket was closed.
    evt.forced = this.wasForced
    evt.isRetrying = this.isRetrying

    // Immediately change state and exit on force close.
    if (this.wasForced) {
      this._stateChanged('CLOSED', 'onclose', evt)

    // Hack P2: Safegaurd against firefox behavior where close event is
    // triggered on page navigation and results in an attempted reconnect.
    } else if (!this.hasUnloaded) {
      // Was open at some point so we need to trigger close evts
      // TODO: Wondering it state change should ALWAYS BE CALLED?
      if (this.hasOpened) {
        this._trigger('onclose', evt)
      }

      this.isRetrying = false
      this.hasOpened = false
      this._reconnect()
    }
  }

  /**
   * @private
   * @desc Simple proxy for onmessage event.
   *
   * @param {Object} evt - WebSocket onmessage evt.
   */
  _onmessage (evt) {
    this._trigger('onmessage', evt)
  }

  /**
   * @private
   * @desc Simple proxy for onerror event.
   *
   * @param {Object} evt - WebSocket onerror evt.
   */
  _onerror (evt) {
    this._trigger('onerror', evt)
  }

  /**
   * @private
   * @desc Helper around ws.close to ensure ws exists. If it does not exist we
   *   fail silently. This seemed logical as closing the socket would have the
   *   same effect as if the socket never existed. In other words no matter what
   *   happens in this method the net effect will always be the same.
   */
  _close () {
    if (this.ws) {
      this.ws.close()
    }
  }

  /**
   * @private
   * @desc Call connect after a delayed timeout. The timeout is calculated using
   *   expotential backoff. As connect attempts increase, the time between connect
   *   attempts will grow (up to a specified connectionMaxRetryInterval).
   */
  _reconnect () {
    let interval = (Math.pow(2, this.attempts) - 1) * 1000
    interval = (interval > this.connectionMaxRetryInterval)
      ? this.connectionMaxRetryInterval
      : interval

    this.attempts ++
    setTimeout(this._connect, interval)
  }

  /**
   * @private
   * @desc Wrapper around ws send to make sure all data is sent in correct
   *   format.
   */
  _send (data) {
    if (this.ws) {
      this._sendPayload(JSON.stringify(data))
    }
  }

  /**
   * @private
   * @desc Proxy to underlying websocket `send` method.
   */
  _sendPayload (payload) {
    this.ws.send(payload)
    return this
  }

  /* ---------------------------------------------------------------------------
   * Queue
   * ------------------------------------------------------------------------ */

  /**
   * @private
   * @desc Begin processing queue.
   */
  _sendQueued () {
    if (!this.queue.isEmpty()) {
      this.queue.process()
    }
  }

  /**
   * @private
   * @desc Send message from tail of queue.
   */
  _processQueueTask (msg, next) {
    this._send(msg)

    if (!this.queue.isEmpty()) {
      this.queueTimer = setTimeout(next, this.queueSendDelay)
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
  _stateChanged (state, evtName, evt) {
    this.readyState = WebSocket[state]
    this._trigger(evtName, evt)
  }

  /**
   * @private
   * @desc Convenience method for semantically calling handlers.
   *
   * @param {String} evtName - Name of event to fire.
   * @param {Object} evt - Raw WebSocket evt we are proxying.
   */
  _trigger (evtName, evt) {
    if (this.debug || RcSocket.debugAll) {
      this.logger.debug('RcSocket', evtName, this.url, evt)
    }

    if (this[evtName]) {
      this[evtName](evt)
    }
  }
}

export default RcSocket
