/* globals WebSocket:true */
/* adapted from: https://github.com/joewalnes/reconnecting-websocket */
'use strict'

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

export enum RcSocketEventName {
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

type GetRcSocketEventType<EventName extends RcSocketEventName> = Parameters<
  NonNullable<RcSocket[EventName]>
>[0]

/* -----------------------------------------------------------------------------
 * RcSocket
 * -------------------------------------------------------------------------- */

export default class RcSocket<
Message extends RcSocketMessage = RcSocketMessage
> {
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

  // private state
  private _ws: RcWebSocket | null = null
  private _attempts: number = 1
  private _shouldReopen: boolean = false
  private _closeType: RcSocketCloseType | null = null
  private _connectTimer: ReturnType<typeof setTimeout> | null = null

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

  /* ---------------------------------------------------------------------------
   * WebSocket Management
   * ------------------------------------------------------------------------ */

  /**
   * @desc Wrapper around WebSocket creation. By wrapping the raw WebSocket we
   *   have the opportunity to manipulate events, change behavior (like adding
   *   reconnection logic), and then finally proxy the events as if we were a
   *   the actual socket.
   */
  private _connect () {
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
      this._trigger(RcSocketEventName.TIMEOUT)
      this._close(RcSocketCloseType.RETRY)
    }, this.settings.connectionTimeout)

    this._stateChanged(
      RcSocketReadyState.CONNECTING,
      RcSocketEventName.CONNECTING
    )
  }

  /**
   * @desc Stop all async code from executing. Used internally anytime a socket
   * is either manually closed, or interpretted as closed
   */
  private _stop () {
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
  private _onopen (evt: Event) {
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
    this._stateChanged(RcSocketReadyState.OPEN, RcSocketEventName.OPEN, evt)
    this._sendQueued()
  }

  /**
   * @desc Responsible for interpretting the various possible close types (force,
   *   retry, etc...) and reconnecting/proxying events accordinly.
   *
   * @param evt - WebSocket onclose evt.
   */
  private _onclose (evt: CloseEvent) {
    this._stop()
    this._ws = null

    // Immediately change state and exit on force close.
    if (this._closeType === RcSocketCloseType.FORCE) {
      this._stateChanged(
        RcSocketReadyState.CLOSED,
        RcSocketEventName.CLOSE,
        Object.assign(evt, {
          forced: true
        })
      )

      if (this._shouldReopen) {
        this.open()
      }
    } else {
      if (this._closeType !== RcSocketCloseType.RETRY) {
        this._trigger(RcSocketEventName.CLOSE, evt)
      }

      this._reconnect()
    }
  }

  /**
   * @desc Simple proxy for onmessage event.
   *
   * @param evt - WebSocket onmessage evt.
   */
  private _onmessage (evt: MessageEvent) {
    this._trigger(RcSocketEventName.MESSAGE, evt)
  }

  /**
   * @desc Simple proxy for onerror event.
   *
   * @param evt - WebSocket onerror evt.
   */
  private _onerror (evt: Event) {
    this._trigger(RcSocketEventName.ERROR, evt)
  }

  /**
   * @desc Helper around ws.close to ensure ws exists. If it does not exist we
   *   fail silently. This seemed logical as closing the socket would have the
   *   same effect as if the socket never existed. In other words no matter what
   *   happens in this method the net effect will always be the same.
   *
   * @param closeType - The type of close ['FORCE', 'RETRY', 'KILL']
   */
  private _close (closeType: RcSocketCloseType) {
    this._closeType = closeType
    this._shouldReopen = false

    if (this._ws && this.readyState < WebSocket.CLOSING) {
      this._ws.close()
      this._stateChanged(RcSocketReadyState.CLOSING, RcSocketEventName.CLOSING)
    }
  }

  /**
   * @desc Call connect after a delayed timeout. The timeout is calculated using
   *   expotential backoff. As connect attempts increase, the time between connect
   *   attempts will grow (up to a specified connectionMaxRetryInterval).
   */
  private _reconnect () {
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
  private _send (data: Message) {
    if (this._ws) {
      this._sendPayload(JSON.stringify(data))
    }
  }

  /**
   * @desc Proxy to underlying websocket `send` method. This is pulled into its
   * own method for debugging/testing purposes.
   */
  private _sendPayload (payload: string) {
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
  private _sendQueued () {
    this.queue.forEach(msg => this._send(msg))
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
  private _stateChanged<EventName extends RcSocketEventName> (
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
  private _trigger<EventName extends RcSocketEventName> (
    evtName: EventName,
    evt?: GetRcSocketEventType<EventName>
  ) {
    if (this.settings.debug) {
      this.settings.logger.debug('RcSocket', evtName, this.url, evt)
    }

    // TODO: Determine why handler cannot be correctly inferred
    const handler = this[evtName] as any
    handler && handler.call(this._ws, evt)
  }
}
