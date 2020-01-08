/* globals WebSocket:true Event: true */
/* adapted from: https://github.com/joewalnes/reconnecting-websocket */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
// This is required in order to extend EventTarget
import { EventTarget } from 'event-target-shim'

/* -----------------------------------------------------------------------------
 * types
 * -------------------------------------------------------------------------- */

export type RcSocketMessage<Value = any> = Record<string | number, Value>

export interface RcSocketSettings {
  /** Flag indicating whether or not to debug. */
  debug: boolean
  /** Logger instance. Defaults to console. */
  logger: RcSocketLogger
  /** Number indicating how long to try connecting before timing out. */
  connectionTimeout: number
  /** Number indicating the maximum interval between connection "retires". */
  connectionMaxRetryInterval: number
}

export interface RcWebSocket extends WebSocket {
  /** Websocket identifier implemented for visibility/debugging purposes. */
  id: number
}

export interface RcSocketLogger {
  /** Method used to ouput message at the "debug" log level. */
  debug: (message?: any, ...optionalParams: any[]) => void
}

export type RcSocketEventHandler = ((this: WebSocket) => any) | null

export enum RcSocketReadyState {
  /** Socket has been created. The connection is not yet open. */
  CONNECTING,
  /** The connection is open and ready to communicate. */
  OPEN,
  /** The connection is in the process of closing. */
  CLOSING,
  /** The connection is closed or couldn't be opened. */
  CLOSED
}

export enum RcSocketCloseType {
  /** The socket was intentionally closed via an explicit call to `close`. */
  FORCE,
  /** The socket was intentionally closed via an explicit call to `kill`. */
  KILL,
  /** The socket was closed in an attempt to retry connecting.  */
  RETRY
}

export enum RcSocketEventHandlerName {
  /** Event broadcast when websocket begins connecting. */
  CONNECTING = 'onconnecting',
  /** Event broadcast when websocket connection times out. */
  TIMEOUT = 'ontimeout',
  /** Event broadcast when websocket error occurs. */
  ERROR = 'onerror',
  /** Event broadcast when the connection is opened. */
  OPEN = 'onopen',
  /** Event broadcast when a message is received from the server. */
  MESSAGE = 'onmessage',
  /** Event broadcast when the connection begings to close */
  CLOSING = 'onclosing',
  /** Event broadcast when the connection is closed. */
  CLOSE = 'onclose'
}

export type RCSocketListener = EventListener | EventListenerObject | null

type GetRcSocketEventType<
EventName extends RcSocketEventHandlerName
> = Parameters<NonNullable<RcSocket[EventName]>>[0]

/* -----------------------------------------------------------------------------
 * RcSocketEvent
 *
 * Need to shim to support envornments that don't support native `Event`
 * (specifically, `react-native`)
 * -------------------------------------------------------------------------- */

class RcSocketEvent {
  type: string

  constructor (type: string) {
    this.type = type
  }
}

/* -----------------------------------------------------------------------------
 * RcSocket
 * -------------------------------------------------------------------------- */

export default class RcSocket<
Message extends RcSocketMessage = RcSocketMessage
> extends EventTarget {
  static defaultSettings: RcSocketSettings = {
    debug: false,
    logger: console,
    connectionTimeout: 2500,
    connectionMaxRetryInterval: 1000
  }

  settings: RcSocketSettings = {
    debug: RcSocket.defaultSettings.debug,
    logger: RcSocket.defaultSettings.logger,
    connectionTimeout: RcSocket.defaultSettings.connectionTimeout,
    connectionMaxRetryInterval:
      RcSocket.defaultSettings.connectionMaxRetryInterval
  }

  // configuration
  url: string
  protocols?: string | string[]

  // handlers
  onclose: WebSocket['onclose'] = null
  onerror: WebSocket['onerror'] = null
  onmessage: WebSocket['onmessage'] = null
  onopen: WebSocket['onopen'] = null
  ontimeout: RcSocketEventHandler = null
  onconnecting: RcSocketEventHandler = null
  onclosing: RcSocketEventHandler = null

  // public state
  readyState: RcSocketReadyState = RcSocketReadyState.CONNECTING
  queue: Message[] = []

  // protected state
  protected _ws: RcWebSocket | null = null
  protected _attempts: number = 1
  protected _shouldReopen: boolean = false
  protected _closeType: RcSocketCloseType | null = null
  protected _connectTimer: ReturnType<typeof setTimeout> | null = null
  protected _listeners: Map<string, Set<RCSocketListener>> = new Map()

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
  constructor (
    url: string,
    protocols?: string | string[],
    settings?: Partial<RcSocketSettings>
  ) {
    super()

    this.url = url
    this.protocols = protocols

    // Mixin instance defined settings
    Object.assign(this.settings, settings)

    // Delay connect so that we can immediately add socket handlers.
    setTimeout(() => this.open(), 0)
  }

  /**
   * @desc Sets initial websocket state and connects. Useful for situations
   * where you want to close the socket and reopen it at a later time.
   *
   * @example
   * socket.close()
   * socket.open()
   */
  open () {
    if (!this.readyState || this.readyState > WebSocket.CLOSING) {
      this.reset()
      this._connect()
    } else if (this.readyState === WebSocket.CLOSING) {
      this._shouldReopen = true
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
  send (data: Message) {
    // If the queue is actively being process we will move this send to be
    // processed within the queue cycle.
    return this.readyState === WebSocket.OPEN
      ? this._send(data)
      : this.queue.push(data)
  }

  /**
   * @desc Explicitly close socket. Overrides default RcSocket reconnection logic.
   *
   * @example
   * socket.close()
   */
  close () {
    this._close(RcSocketCloseType.FORCE)
  }

  /**
   * @desc Hard kill by cleaning up all handlers.
   *
   * @example
   * socket.kill()
   */
  kill () {
    this._close(RcSocketCloseType.KILL)
    this.reset()
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
    this.kill()
    this._connect()
  }

  /**
   * @desc Reset socket to initial state.
   *
   * @example
   * socket.reset()
   */
  reset () {
    this._stop()

    if (this._ws) {
      this._ws.onopen = null
      this._ws.onclose = null
      this._ws.onmessage = null
      this._ws.onerror = null
    }

    this._ws = null
    this.readyState = RcSocketReadyState.CONNECTING
    this._closeType = null
    this._shouldReopen = false
    this._attempts = 1
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
  addEventListener (
    type: string,
    listener: EventListener | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    const listenerKey = this._getListenerKey(type, options)
    const listenerSet =
      this._listeners.get(listenerKey) || new Set<RCSocketListener>()
    this._listeners.set(listenerKey, listenerSet.add(listener))

    super.addEventListener(type, listener, options)

    return () => this.removeEventListener(type, listener, options)
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
  removeEventListener (
    type: string,
    listener: EventListener | EventListenerObject | null,
    options?: EventListenerOptions | boolean
  ) {
    const listenerKey = this._getListenerKey(type, options)
    const listenerSet = this._listeners.get(listenerKey)
    if (listenerSet) {
      listenerSet.delete(listener)
      !listenerSet.size && this._listeners.delete(listenerKey)
    }

    super.removeEventListener(type, listener, options)
  }

  /**
   * @desc Removes all event listeners from the EventTarget.
   *
   * @example
   * socket.removeAllEventListeners()
   */
  removeAllEventListeners () {
    this._listeners.forEach((listenerSet, key) => {
      const [type, _capture] = key.split('🚧')
      const capture = _capture === 'undefined' ? undefined : _capture === 'true'

      listenerSet.forEach(listener =>
        this.removeEventListener(type, listener, capture)
      )
    })

    this._listeners.clear()
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
  protected _connect () {
    this._ws = Object.assign(new WebSocket(this.url, this.protocols), {
      id: Date.now()
    })

    this._ws.onopen = this._onopen.bind(this)
    this._ws.onclose = this._onclose.bind(this)
    this._ws.onmessage = this._onmessage.bind(this)
    this._ws.onerror = this._onerror.bind(this)

    // Rather than letting the websocket set indefinetely, we close the socket
    // after a specified timeout. The close will automatically handle retrying.
    this._connectTimer = setTimeout(() => {
      this._trigger(RcSocketEventHandlerName.TIMEOUT)
      this._close(RcSocketCloseType.RETRY)
    }, this.settings.connectionTimeout)

    this._stateChanged(
      RcSocketReadyState.CONNECTING,
      RcSocketEventHandlerName.CONNECTING
    )
  }

  /**
   * @desc Stop all async code from executing. Used internally anytime a socket
   * is either manually closed, or interpretted as closed
   */
  protected _stop () {
    if (this._connectTimer) {
      clearTimeout(this._connectTimer)
      this._connectTimer = null
    }
  }

  /**
   * @desc Timeout cleanup, state management, and queue handling.
   *
   * @param evt - WebSocket onopen evt.
   */
  protected _onopen (evt: Event) {
    if (this._connectTimer) {
      clearTimeout(this._connectTimer)
      this._connectTimer = null
    }

    // Fix error where close is explicitly called but onopen event is still
    // triggered.
    if (this._closeType === RcSocketCloseType.FORCE) {
      return this.close()
    }

    this._attempts = 1
    this._stateChanged(
      RcSocketReadyState.OPEN,
      RcSocketEventHandlerName.OPEN,
      evt
    )
    this._sendQueued()
  }

  /**
   * @desc Responsible for interpretting the various possible close types (force,
   *   retry, etc...) and reconnecting/proxying events accordingly.
   *
   * @param evt - WebSocket onclose evt.
   */
  protected _onclose (evt: CloseEvent) {
    this._stop()
    this._ws = null

    // Immediately change state and exit on force close.
    if (this._closeType === RcSocketCloseType.FORCE) {
      this._stateChanged(
        RcSocketReadyState.CLOSED,
        RcSocketEventHandlerName.CLOSE,
        Object.assign(evt, {
          forced: true
        })
      )

      if (this._shouldReopen) {
        this.open()
      }
    } else {
      if (this._closeType !== RcSocketCloseType.RETRY) {
        this._trigger(RcSocketEventHandlerName.CLOSE, evt)
      }

      this._reconnect()
    }
  }

  /**
   * @desc Simple proxy for onmessage event.
   *
   * @param evt - WebSocket onmessage evt.
   */
  protected _onmessage (evt: MessageEvent) {
    this._trigger(RcSocketEventHandlerName.MESSAGE, evt)
  }

  /**
   * @desc Simple proxy for onerror event.
   *
   * @param evt - WebSocket onerror evt.
   */
  protected _onerror (evt: Event) {
    this._trigger(RcSocketEventHandlerName.ERROR, evt)
  }

  /**
   * @desc Helper around ws.close to ensure ws exists. If it does not exist we
   *   fail silently. This seemed logical as closing the socket would have the
   *   same effect as if the socket never existed. In other words no matter what
   *   happens in this method the net effect will always be the same.
   *
   * @param closeType - The type of close ['FORCE', 'RETRY', 'KILL']
   */
  protected _close (closeType: RcSocketCloseType) {
    this._closeType = closeType
    this._shouldReopen = false

    if (this._ws && this.readyState < WebSocket.CLOSING) {
      this._ws.close()
      this._stateChanged(
        RcSocketReadyState.CLOSING,
        RcSocketEventHandlerName.CLOSING
      )
    }
  }

  /**
   * @desc Call connect after a delayed timeout. The timeout is calculated using
   *   expotential backoff. As connect attempts increase, the time between connect
   *   attempts will grow (up to a specified connectionMaxRetryInterval).
   */
  protected _reconnect () {
    let interval = (Math.pow(2, this._attempts) - 1) * 1000
    interval =
      interval > this.settings.connectionMaxRetryInterval
        ? this.settings.connectionMaxRetryInterval
        : interval

    this._attempts++
    setTimeout(() => this._connect(), interval)
  }

  /**
   * @desc Wrapper around ws send to make sure all data is sent in correct
   *   format.
   */
  protected _send (data: Message) {
    if (this._ws) {
      this._sendPayload(JSON.stringify(data))
    }
  }

  /**
   * @desc Proxy to underlying websocket `send` method. This is pulled into its
   * own method for debugging/testing purposes.
   */
  protected _sendPayload (payload: string) {
    if (this._ws) {
      this._ws.send(payload)
    }
  }

  /* ---------------------------------------------------------------------------
   * Queue
   * ------------------------------------------------------------------------ */

  /**
   * @desc Begin processing queue.
   */
  protected _sendQueued () {
    this.queue.forEach(msg => this._send(msg))
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
  protected _getListenerKey (
    type: string,
    options?: boolean | AddEventListenerOptions
  ) {
    const capture = typeof options === 'object' ? options.capture : options
    // Using an obscure emoji as a separator to reduce any collisions that
    // could occur with custom event types. Example: `message:1234`
    return typeof capture === 'boolean'
      ? `${type}🚧${capture.toString()}`
      : `${type}🚧undefined`
  }

  /**
   * @desc Update state, log, trigger.
   *
   * @param state - String representing WebSocket.
   * @param name - String of the event name.
   * @param evt - Event object.
   */
  protected _stateChanged<EventName extends RcSocketEventHandlerName> (
    readyState: RcSocketReadyState,
    evtName: EventName,
    evt?: GetRcSocketEventType<EventName>
  ) {
    this.readyState = readyState
    this._trigger(evtName, evt)
  }

  /**
   * @desc Convenience method for semantically calling handlers.
   *
   * @param evtName - Name of event to fire.
   * @param evt - Raw WebSocket evt we are proxying.
   */
  protected _trigger<EventName extends RcSocketEventHandlerName> (
    evtHandlerName: EventName,
    evt?: GetRcSocketEventType<EventName>
  ) {
    const event =
      typeof evt === 'undefined'
        ? (new RcSocketEvent(evtHandlerName.slice(2)) as Event)
        : (new (evt as any).constructor(evt.type, evt) as NonNullable<
            typeof evt
          >)

    if (this.settings.debug) {
      this.settings.logger.debug('RcSocket', evtHandlerName, this.url, event)
    }

    // TODO: Determine why handler cannot be correctly inferred
    const handler = this[evtHandlerName] as any
    handler && handler.call(this._ws, event)

    this.dispatchEvent(event)
  }
}
