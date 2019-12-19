export declare type RcSocketMessage<Value = any> = Record<string | number, Value>;
export interface RcSocketSettings {
    /** Flag indicating whether or not to debug. */
    debug: boolean;
    /** Logger instance. Defaults to console. */
    logger: RcSocketLogger;
    /** Number indicating how long to try connecting before timing out. */
    connectionTimeout: number;
    /** Number indicating the maximum interval between connection "retires". */
    connectionMaxRetryInterval: number;
}
export interface RcWebSocket extends WebSocket {
    /** Websocket identifier implemented for visibility/debugging purposes. */
    id: number;
}
export interface RcSocketLogger {
    /** Method used to ouput message at the "debug" log level. */
    debug: (message?: any, ...optionalParams: any[]) => void;
}
export declare type RcSocketEventHandler = ((this: WebSocket) => any) | null;
export declare enum RcSocketReadyState {
    /** Socket has been created. The connection is not yet open. */
    CONNECTING = 0,
    /** The connection is open and ready to communicate. */
    OPEN = 1,
    /** The connection is in the process of closing. */
    CLOSING = 2,
    /** The connection is closed or couldn't be opened. */
    CLOSED = 3
}
export declare enum RcSocketCloseType {
    /** The socket was intentionally closed via an explicit call to `close`. */
    FORCE = 0,
    /** The socket was intentionally closed via an explicit call to `kill`. */
    KILL = 1,
    /** The socket was closed in an attempt to retry connecting.  */
    RETRY = 2
}
export declare enum RcSocketEventName {
    /** Event broadcast when websocket begins connecting. */
    CONNECTING = "onconnecting",
    /** Event broadcast when websocket connection times out. */
    TIMEOUT = "ontimeout",
    /** Event broadcast when websocket error occurs. */
    ERROR = "onerror",
    /** Event broadcast when the connection is opened. */
    OPEN = "onopen",
    /** Event broadcast when a message is received from the server. */
    MESSAGE = "onmessage",
    /** Event broadcast when the connection begings to close */
    CLOSING = "onclosing",
    /** Event broadcast when the connection is closed. */
    CLOSE = "onclose"
}
export default class RcSocket<Message extends RcSocketMessage = RcSocketMessage> {
    static defaultSettings: RcSocketSettings;
    settings: RcSocketSettings;
    url: string;
    protocols?: string | string[];
    onclose: WebSocket['onclose'];
    onerror: WebSocket['onerror'];
    onmessage: WebSocket['onmessage'];
    onopen: WebSocket['onopen'];
    ontimeout: RcSocketEventHandler;
    onconnecting: RcSocketEventHandler;
    onclosing: RcSocketEventHandler;
    readyState: RcSocketReadyState;
    queue: Message[];
    private _ws;
    private _attempts;
    private _shouldReopen;
    private _closeType;
    private _connectTimer;
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
    constructor(url: string, protocols?: string | string[], settings?: Partial<RcSocketSettings>);
    /**
     * @desc Sets initial websocket state and connects. Useful for situations
     * where you want to close the socket and reopen it at a later time.
     *
     * @example
     * socket.close()
     * socket.open()
     */
    open(): void;
    /**
     * @desc Wrapper around ws.send that adds queue functionality when socket is
     *   not in a connected readyState.
     *
     * @example
     * socket.send({ prop: 'val' })
     *
     * @param data - data to send via web socket.
     */
    send(data: Message): number | void;
    /**
     * @desc Explicitly close socket. Overrides default RcSocket reconnection logic.
     *
     * @example
     * socket.close()
     */
    close(): void;
    /**
     * @desc Hard kill by cleaning up all handlers.
     *
     * @example
     * socket.kill()
     */
    kill(): void;
    /**
     * @desc Refresh the connection if open (close, re-open). If the app suspects
     *   the socket is stale (occurs when changing from wifi -> carrier or vice
     *   versa), this method will close the existing socket and reconnect.
     *
     * @example
     * socket.reboot()
     */
    reboot(): void;
    /**
     * @desc Reset socket to initial state.
     *
     * @example
     * socket.reset()
     */
    reset(): void;
    /**
     * @desc Wrapper around WebSocket creation. By wrapping the raw WebSocket we
     *   have the opportunity to manipulate events, change behavior (like adding
     *   reconnection logic), and then finally proxy the events as if we were a
     *   the actual socket.
     */
    private _connect;
    /**
     * @desc Stop all async code from executing. Used internally anytime a socket
     * is either manually closed, or interpretted as closed
     */
    private _stop;
    /**
     * @desc Timeout cleanup, state management, and queue handling.
     *
     * @param evt - WebSocket onopen evt.
     */
    private _onopen;
    /**
     * @desc Responsible for interpretting the various possible close types (force,
     *   retry, etc...) and reconnecting/proxying events accordinly.
     *
     * @param evt - WebSocket onclose evt.
     */
    private _onclose;
    /**
     * @desc Simple proxy for onmessage event.
     *
     * @param evt - WebSocket onmessage evt.
     */
    private _onmessage;
    /**
     * @desc Simple proxy for onerror event.
     *
     * @param evt - WebSocket onerror evt.
     */
    private _onerror;
    /**
     * @desc Helper around ws.close to ensure ws exists. If it does not exist we
     *   fail silently. This seemed logical as closing the socket would have the
     *   same effect as if the socket never existed. In other words no matter what
     *   happens in this method the net effect will always be the same.
     *
     * @param closeType - The type of close ['FORCE', 'RETRY', 'KILL']
     */
    private _close;
    /**
     * @desc Call connect after a delayed timeout. The timeout is calculated using
     *   expotential backoff. As connect attempts increase, the time between connect
     *   attempts will grow (up to a specified connectionMaxRetryInterval).
     */
    private _reconnect;
    /**
     * @desc Wrapper around ws send to make sure all data is sent in correct
     *   format.
     */
    private _send;
    /**
     * @desc Proxy to underlying websocket `send` method. This is pulled into its
     * own method for debugging/testing purposes.
     */
    private _sendPayload;
    /**
     * @desc Begin processing queue.
     */
    private _sendQueued;
    /**
     * @desc Update state, log, trigger.
     *
     * @param state - String representing WebSocket.
     * @param name - String of the event name.
     * @param evt - Event object.
     */
    private _stateChanged;
    /**
     * @desc Convenience method for semantically calling handlers.
     *
     * @param evtName - Name of event to fire.
     * @param evt - Raw WebSocket evt we are proxying.
     */
    private _trigger;
}
