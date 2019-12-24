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
export declare enum RcSocketEventHandlerName {
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
export declare type RCSocketListener = EventListener | EventListenerObject | null;
declare type GetRcSocketEventType<EventName extends RcSocketEventHandlerName> = Parameters<NonNullable<RcSocket[EventName]>>[0];
export default class RcSocket<Message extends RcSocketMessage = RcSocketMessage> extends EventTarget {
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
    protected _ws: RcWebSocket | null;
    protected _attempts: number;
    protected _shouldReopen: boolean;
    protected _closeType: RcSocketCloseType | null;
    protected _connectTimer: ReturnType<typeof setTimeout> | null;
    protected _listeners: Map<string, Set<RCSocketListener>>;
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
    addEventListener(type: string, listener: EventListener | EventListenerObject | null, options?: boolean | AddEventListenerOptions): () => void;
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
    removeEventListener(type: string, listener: EventListener | EventListenerObject | null, options?: EventListenerOptions | boolean): void;
    /**
     * @desc Removes all event listeners from the EventTarget.
     *
     * @example
     * socket.removeAllEventListeners()
     */
    removeAllEventListeners(): void;
    /**
     * @desc Wrapper around WebSocket creation. By wrapping the raw WebSocket we
     *   have the opportunity to manipulate events, change behavior (like adding
     *   reconnection logic), and then finally proxy the events as if we were a
     *   the actual socket.
     */
    protected _connect(): void;
    /**
     * @desc Stop all async code from executing. Used internally anytime a socket
     * is either manually closed, or interpretted as closed
     */
    protected _stop(): void;
    /**
     * @desc Timeout cleanup, state management, and queue handling.
     *
     * @param evt - WebSocket onopen evt.
     */
    protected _onopen(evt: Event): void;
    /**
     * @desc Responsible for interpretting the various possible close types (force,
     *   retry, etc...) and reconnecting/proxying events accordingly.
     *
     * @param evt - WebSocket onclose evt.
     */
    protected _onclose(evt: CloseEvent): void;
    /**
     * @desc Simple proxy for onmessage event.
     *
     * @param evt - WebSocket onmessage evt.
     */
    protected _onmessage(evt: MessageEvent): void;
    /**
     * @desc Simple proxy for onerror event.
     *
     * @param evt - WebSocket onerror evt.
     */
    protected _onerror(evt: Event): void;
    /**
     * @desc Helper around ws.close to ensure ws exists. If it does not exist we
     *   fail silently. This seemed logical as closing the socket would have the
     *   same effect as if the socket never existed. In other words no matter what
     *   happens in this method the net effect will always be the same.
     *
     * @param closeType - The type of close ['FORCE', 'RETRY', 'KILL']
     */
    protected _close(closeType: RcSocketCloseType): void;
    /**
     * @desc Call connect after a delayed timeout. The timeout is calculated using
     *   expotential backoff. As connect attempts increase, the time between connect
     *   attempts will grow (up to a specified connectionMaxRetryInterval).
     */
    protected _reconnect(): void;
    /**
     * @desc Wrapper around ws send to make sure all data is sent in correct
     *   format.
     */
    protected _send(data: Message): void;
    /**
     * @desc Proxy to underlying websocket `send` method. This is pulled into its
     * own method for debugging/testing purposes.
     */
    protected _sendPayload(payload: string): void;
    /**
     * @desc Begin processing queue.
     */
    protected _sendQueued(): void;
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
    protected _getListenerKey(type: string, options?: boolean | AddEventListenerOptions): string;
    /**
     * @desc Update state, log, trigger.
     *
     * @param state - String representing WebSocket.
     * @param name - String of the event name.
     * @param evt - Event object.
     */
    protected _stateChanged<EventName extends RcSocketEventHandlerName>(readyState: RcSocketReadyState, evtName: EventName, evt?: GetRcSocketEventType<EventName>): void;
    /**
     * @desc Convenience method for semantically calling handlers.
     *
     * @param evtName - Name of event to fire.
     * @param evt - Raw WebSocket evt we are proxying.
     */
    protected _trigger<EventName extends RcSocketEventHandlerName>(evtHandlerName: EventName, evt?: GetRcSocketEventType<EventName>): void;
}
export {};
